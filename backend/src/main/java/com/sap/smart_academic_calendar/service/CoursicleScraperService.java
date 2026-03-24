package com.sap.smart_academic_calendar.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sap.smart_academic_calendar.dto.CoursicleDataDTO;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for scraping course data from Coursicle.com
 *
 * Coursicle pages are server-side rendered PHP — content is in the initial HTML,
 * so Jsoup works without a headless browser. However, the page uses NO meaningful
 * CSS classes on the data fields. Instead, data is found by locating well-known
 * section heading labels (e.g., "Recent Professors", "Usually Offered") and
 * reading the content of their following sibling element.
 *
 * Additionally, each page embeds a JSON-LD {@code <script type="application/ld+json">}
 * block with structured course data; this is used as the primary source for
 * description and credit hours.
 *
 * Fields extracted:
 *  - instructor  → first name in "Recent Professors" section
 *  - schedule    → text of "Usually Offered" section
 *  - description → JSON-LD "description" field (fallback: "Description" section)
 *  - credits     → JSON-LD "numberOfCredits" field (fallback: "Credits" section)
 *  - semesters   → comma-list from "Recent Semesters" section
 */
@Service
public class CoursicleScraperService {

    private static final Logger log = LoggerFactory.getLogger(CoursicleScraperService.class);

    private static final String COURSICLE_BASE_URL = "https://www.coursicle.com/bgsu/courses";
    // Use a real browser user-agent to avoid 403/empty-page responses
    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    private static final int TIMEOUT_MS = 15000; // 15 seconds

    private final ObjectMapper objectMapper = new ObjectMapper();

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Scrape all available data for a single BGSU course from Coursicle.
     *
     * @param subject Course subject (e.g., "CS", "MATH", "SE")
     * @param number  Course number (e.g., "2010", "1280", "3540")
     * @return Populated {@link CoursicleDataDTO}, or {@code null} on unexpected failure
     * @throws IOException on network errors / timeouts
     */
    public CoursicleDataDTO scrapeCourse(String subject, String number) throws IOException {
        String url = String.format("%s/%s/%s/", COURSICLE_BASE_URL, subject, number);
        String code = subject + " " + number;

        log.info("Scraping Coursicle for {}: {}", code, url);

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .get();

            String instructor  = extractInstructor(doc, code);
            String schedule    = extractSchedule(doc, code);
            String description = extractDescription(doc, code);
            Integer credits    = extractCredits(doc, code);
            List<String> sems  = extractSemesters(doc, code);

            log.info("Scraped {}: instructor='{}', schedule='{}', credits={}, semesters={}",
                    code, instructor, schedule, credits, sems.size());

            CoursicleDataDTO dto = new CoursicleDataDTO();
            dto.setCode(code);
            dto.setInstructor(instructor);
            dto.setSchedule(schedule);
            dto.setDescription(description);
            dto.setCredits(credits);
            dto.setSemesters(sems);
            return dto;

        } catch (IOException e) {
            log.error("Network error scraping {}: {}", code, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error scraping {}: {}", code, e.getMessage(), e);
            return null;
        }
    }

    /** Returns {@code true} if the status code indicates Coursicle rate-limited us. */
    public boolean isRateLimited(int statusCode) {
        return statusCode == 429;
    }

    // -------------------------------------------------------------------------
    // Section-heading helpers
    // -------------------------------------------------------------------------

    /**
     * Locate a section on the page by its exact heading text (e.g., "Recent Professors"),
     * then return the text content of the immediately following sibling element.
     *
     * Coursicle renders sections as:
     * <pre>
     *   &lt;b&gt;Recent Professors&lt;/b&gt;
     *   &lt;div&gt;Tianyi Song , Rob Green , ...&lt;/div&gt;
     * </pre>
     * or occasionally wraps the heading in an outer div, so we also check the
     * parent element's next sibling.
     *
     * @param doc         Parsed Jsoup document
     * @param headingText Exact text of the section label
     * @return Trimmed text of the content element, or {@code null} if not found
     */
    private String findSectionContent(Document doc, String headingText) {
        Elements candidates = doc.getElementsContainingOwnText(headingText);
        for (Element el : candidates) {
            if (!el.ownText().trim().equals(headingText)) {
                continue;
            }
            // 1) Try the immediate next element sibling
            Element nextSib = el.nextElementSibling();
            if (nextSib != null) {
                String text = nextSib.text().trim();
                if (!text.isEmpty()) {
                    return text;
                }
            }
            // 2) Try the parent's next element sibling (heading wrapped in a container)
            Element parent = el.parent();
            if (parent != null) {
                Element parentNextSib = parent.nextElementSibling();
                if (parentNextSib != null) {
                    String text = parentNextSib.text().trim();
                    if (!text.isEmpty()) {
                        return text;
                    }
                }
            }
        }
        return null;
    }

    // -------------------------------------------------------------------------
    // Field extractors
    // -------------------------------------------------------------------------

    /**
     * Extract the most recent professor from the "Recent Professors" section.
     * The section lists professors newest-first, separated by commas.
     * We return only the first name to keep the instructor field concise.
     */
    private String extractInstructor(Document doc, String code) {
        String content = findSectionContent(doc, "Recent Professors");
        if (content != null && !content.isBlank()) {
            // e.g. "Tianyi Song , Rob Green , Jadwiga Carlson , ..."
            String first = content.split(",")[0].trim();
            if (!first.isEmpty()) {
                log.debug("{}: instructor = '{}'", code, first);
                return first;
            }
        }
        log.warn("{}: 'Recent Professors' section not found — defaulting to 'Staff'", code);
        return "Staff";
    }

    /**
     * Extract the typical meeting pattern from the "Usually Offered" section.
     * Example value: "MWF (50 minutes), M (50 minutes)"
     */
    private String extractSchedule(Document doc, String code) {
        String content = findSectionContent(doc, "Usually Offered");
        if (content != null && !content.isBlank()) {
            log.debug("{}: schedule = '{}'", code, content);
            return content;
        }
        log.warn("{}: 'Usually Offered' section not found — defaulting to 'TBA'", code);
        return "TBA";
    }

    /**
     * Extract the course description.
     * Primary source: JSON-LD {@code description} field (most reliable).
     * Fallback: "Description" section heading approach.
     */
    private String extractDescription(Document doc, String code) {
        // Primary: JSON-LD structured data
        Elements scripts = doc.select("script[type=application/ld+json]");
        for (Element script : scripts) {
            try {
                JsonNode root = objectMapper.readTree(script.html());
                if (root.has("description")) {
                    String desc = root.get("description").asText().trim();
                    if (!desc.isEmpty()) {
                        log.debug("{}: description found via JSON-LD ({} chars)", code, desc.length());
                        return desc;
                    }
                }
            } catch (Exception e) {
                log.debug("{}: could not parse JSON-LD script: {}", code, e.getMessage());
            }
        }
        // Fallback: section heading
        String content = findSectionContent(doc, "Description");
        if (content != null && !content.isBlank()) {
            log.debug("{}: description found via section heading", code);
            return content;
        }
        return null;
    }

    /**
     * Extract credit hours.
     * Primary source: JSON-LD {@code numberOfCredits} field.
     * Fallback: "Credits" section heading approach.
     */
    private Integer extractCredits(Document doc, String code) {
        // Primary: JSON-LD structured data
        Elements scripts = doc.select("script[type=application/ld+json]");
        for (Element script : scripts) {
            try {
                JsonNode root = objectMapper.readTree(script.html());
                if (root.has("numberOfCredits")) {
                    String val = root.get("numberOfCredits").asText().trim();
                    if (!val.isEmpty()) {
                        return Integer.parseInt(val);
                    }
                }
            } catch (Exception e) {
                log.debug("{}: could not parse credits from JSON-LD: {}", code, e.getMessage());
            }
        }
        // Fallback: section heading
        String content = findSectionContent(doc, "Credits");
        if (content != null && !content.isBlank()) {
            try {
                return Integer.parseInt(content.trim());
            } catch (NumberFormatException e) {
                log.debug("{}: could not parse credits value '{}'", code, content);
            }
        }
        return null;
    }

    /**
     * Extract recent semesters from the "Recent Semesters" section.
     * Returns them as an ordered list, newest first.
     * Example input: "Fall 2025, Spring 2025, Fall 2024, Spring 2024, Fall 2023"
     */
    private List<String> extractSemesters(Document doc, String code) {
        String content = findSectionContent(doc, "Recent Semesters");
        if (content != null && !content.isBlank()) {
            List<String> semesters = Arrays.stream(content.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            log.debug("{}: {} semesters found", code, semesters.size());
            return semesters;
        }
        return new ArrayList<>();
    }
}
