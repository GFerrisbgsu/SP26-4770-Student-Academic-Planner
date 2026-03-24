# Recommended VS Code Extensions

This document lists essential VS Code extensions for Spring Boot development with this project.

---

## Quick Install (All at Once)

Copy and paste this command in your terminal to install all recommended extensions:

```powershell
code --install-extension ms-azuretools.vscode-docker && `
code --install-extension vscjava.vscode-java-debug && `
code --install-extension ms-vscode-remote.remote-containers && `
code --install-extension ms-azuretools.vscode-docker && `
code --install-extension vscjava.vscode-java-pack && `
code --install-extension donjayamanne.git-extension-pack && `
code --install-extension donjayamanne.githistory && `
code --install-extension GitHub.copilot && `
code --install-extension eamodio.gitlens && `
code --install-extension oderwat.indent-rainbow && `
code --install-extension redhat.java && `
code --install-extension vscjava.vscode-maven && `
code --install-extension mtxr.sqltools && `
code --install-extension mtxr.sqltools-driver-pg && `
code --install-extension hbenl.vscode-test-explorer && `
code --install-extension vscjava.vscode-java-test
```

---

## Essential Extensions (Required)

### 1. Extension Pack for Java
**ID:** `vscjava.vscode-java-pack`

**What it does:**
- Bundle of essential Java development tools
- Includes: Language Support, Debugger, Test Runner, Maven, Project Manager, and Dependency Viewer

**Why you need it:**
- ✅ Core Java development functionality
- ✅ IntelliSense (code completion)
- ✅ Syntax highlighting
- ✅ Code navigation (Go to Definition, Find References)
- ✅ Refactoring tools

**Note:** This pack includes several extensions listed below, so you get them automatically!

---

### 2. Language Support for Java(TM) by Red Hat
**ID:** `redhat.java`

**What it does:**
- Provides Java language server
- Powers IntelliSense, linting, and formatting

**Why you need it:**
- ✅ Auto-completion for Java code
- ✅ Error detection and quick fixes
- ✅ Import organization
- ✅ Code formatting

**Included in:** Extension Pack for Java

---

### 3. Debugger for Java
**ID:** `vscjava.vscode-java-debug`

**What it does:**
- Enables debugging Java applications
- Set breakpoints, inspect variables, step through code

**Why you need it:**
- ✅ Debug Spring Boot applications
- ✅ Step through code line by line
- ✅ Inspect variable values at runtime
- ✅ Evaluate expressions in debug console

**How to use:**
1. Click on line number to set breakpoint (red dot appears)
2. Press F5 or click "Run and Debug" icon
3. Select "Java" configuration
4. App pauses at breakpoints for inspection

**Included in:** Extension Pack for Java

---

### 4. Maven for Java
**ID:** `vscjava.vscode-maven`

**What it does:**
- Integrates Maven build tool into VS Code
- Manage dependencies, run goals, view project structure

**Why you need it:**
- ✅ Build project: `./mvnw clean install`
- ✅ Run specific goals: `compile`, `test`, `package`
- ✅ View and update dependencies in `pom.xml`
- ✅ Maven project explorer sidebar

**How to use:**
1. Open Maven panel in sidebar (M icon)
2. Expand your project to see lifecycle goals
3. Right-click goal → Execute
4. Or use terminal: `./mvnw <goal>`

**Included in:** Extension Pack for Java

---

### 5. Test Runner for Java
**ID:** `vscjava.vscode-java-test`

**What it does:**
- Run and debug JUnit tests
- View test results in sidebar

**Why you need it:**
- ✅ Run individual tests or entire test classes
- ✅ See test results inline (✓ or ✗)
- ✅ Debug failing tests
- ✅ Test coverage reports

**How to use:**
1. Open Testing panel in sidebar (beaker icon)
2. Click play button next to test to run
3. Or click "Run Test" link above test method in code

**Included in:** Extension Pack for Java

---

## Docker & Containers

### 6. Docker
**ID:** `ms-azuretools.vscode-docker`

**What it does:**
- Manage Docker containers, images, networks, and volumes
- View container logs
- Start/stop containers from VS Code

**Why you need it:**
- ✅ Visual interface for `docker ps`, `docker logs`
- ✅ Right-click containers for quick actions
- ✅ Edit Dockerfiles with IntelliSense
- ✅ View and manage Docker Compose services

**How to use:**
1. Click Docker icon in sidebar (whale logo)
2. Explore: Containers, Images, Registries, Networks, Volumes
3. Right-click container → View Logs, Stop, Restart, etc.
4. Right-click image → Run, Remove, Inspect

**Real-world use in this project:**
- View `smart-academic-calendar-db` and `smart-academic-calendar-pgadmin` containers
- Check PostgreSQL logs without terminal commands
- Quickly restart database if needed

---

### 7. Dev Containers
**ID:** `ms-vscode-remote.remote-containers`

**What it does:**
- Develop inside Docker containers
- Entire development environment in a container

**Why you might need it:**
- ✅ Consistent development environment across team
- ✅ Isolate project dependencies
- ✅ Avoid "works on my machine" issues

**Note:** Not required for this project but useful for advanced setups

---

## Database Tools

### 8. SQLTools
**ID:** `mtxr.sqltools`

**What it does:**
- Database management and SQL client in VS Code
- Connect to databases, run queries, browse tables

**Why you need it:**
- ✅ Query database without leaving VS Code
- ✅ Browse tables and view data
- ✅ Auto-completion for SQL queries
- ✅ Save queries for reuse

**How to use:**
1. Click SQLTools icon in sidebar (database icon)
2. Add connection (see DATABASE.md for setup)
3. Right-click table → Show Table Records
4. Create new SQL file → Write query → Ctrl+E Ctrl+E to run

---

### 9. SQLTools PostgreSQL Driver (REQUIRED for this project)
**ID:** `mtxr.sqltools-driver-pg`

**What it does:**
- Adds PostgreSQL support to SQLTools
- Required to connect to the project's PostgreSQL database

**Why you need it:**
- ✅ Connect to `appdb` database
- ✅ View `users` and other tables
- ✅ Test SQL queries quickly

**Note:** Install SQLTools first, then install this driver

---

## Git & Version Control

### 10. Git Extension Pack
**ID:** `donjayamanne.git-extension-pack`

**What it does:**
- Bundle of popular Git extensions
- Includes Git History, Project Manager, and gitignore support

**Why you need it:**
- ✅ Enhanced Git functionality
- ✅ Better commit history visualization
- ✅ Project switching
- ✅ Gitignore file support

---

### 11. Git History
**ID:** `donjayamanne.githistory`

**What it does:**
- View git log, file history, and compare branches
- Visualize commit history

**Why you need it:**
- ✅ See who changed what and when
- ✅ Compare file versions
- ✅ Search commit history
- ✅ View branch graphs

**How to use:**
1. Right-click file → Git: View File History
2. Or press Ctrl+Shift+P → "Git: View History"
3. Click commits to see changes

**Included in:** Git Extension Pack

---

### 12. GitLens — Git supercharged
**ID:** `eamodio.gitlens`

**What it does:**
- Enhanced Git integration with blame annotations
- Shows who wrote each line of code and when

**Why you need it:**
- ✅ Inline blame annotations (see author of each line)
- ✅ Rich commit and file history
- ✅ Compare branches and commits
- ✅ Visual file history explorer

**How to use:**
- GitLens annotations appear automatically in editor
- Hover over line to see commit details
- Click GitLens icon in sidebar for deeper insights

---

### 13. GitHub Copilot
**ID:** `GitHub.copilot`

**What it does:**
- AI-powered code suggestions
- Completes functions, classes, comments

**Why you might want it:**
- ✅ Speeds up coding with AI suggestions
- ✅ Learn patterns from suggestions
- ✅ Generate boilerplate code quickly

**Note:** 
- Requires GitHub Copilot subscription ($10/month or free for students)
- Not required but very helpful for learning and productivity

**How to use:**
1. Start typing code or comment
2. Copilot suggests completions (gray text)
3. Press Tab to accept suggestion
4. Press Ctrl+Enter for multiple suggestions

---

## Testing Tools

### 14. Test Explorer UI
**ID:** `hbenl.vscode-test-explorer`

**What it does:**
- Unified interface for running tests
- Works with various testing frameworks

**Why you need it:**
- ✅ Visual test explorer in sidebar
- ✅ Run/debug tests with one click
- ✅ See test results at a glance
- ✅ Group tests by suite/file

**Note:** Test Runner for Java provides similar functionality specifically for JUnit

---

## Code Quality & Readability

### 15. indent-rainbow
**ID:** `oderwat.indent-rainbow`

**What it does:**
- Colorizes indentation levels
- Makes code structure easier to see

**Why you need it:**
- ✅ Visual guide for nested code blocks
- ✅ Easier to spot indentation errors
- ✅ Improves code readability

**Example:**
```java
public class Example {
    public void method() {        // Level 1 - light color
        if (condition) {           // Level 2 - darker color
            for (int i = 0; i < 10; i++) {  // Level 3 - even darker
                System.out.println(i);       // Level 4 - darkest
            }
        }
    }
}
```

---

## Extension Settings & Tips

### Recommended Settings

Add these to your VS Code settings (Ctrl+, or Cmd+,):

```json
{
  // Java
  "java.configuration.updateBuildConfiguration": "automatic",
  "java.saveActions.organizeImports": true,
  
  // Maven
  "maven.terminal.useJavaHome": true,
  
  // Git
  "gitlens.hovers.currentLine.over": "line",
  "git.autofetch": true,
  
  // SQLTools
  "sqltools.useNodeRuntime": true,
  
  // Docker
  "docker.showStartPage": false
}
```

### Workspace Recommendations

This project includes a `.vscode/extensions.json` file that recommends these extensions. When you open the project, VS Code will prompt you to install missing recommendations.

---

## Troubleshooting Extensions

### Extension Not Working

1. **Reload VS Code:** Ctrl+Shift+P → "Reload Window"
2. **Check extension is enabled:** Extensions panel → Search extension → Make sure it's enabled
3. **Update extension:** Right-click extension → Update
4. **Reinstall:** Right-click extension → Uninstall → Reinstall

### Java Extensions Not Working

1. **Clean Java workspace:**
   - Ctrl+Shift+P → "Java: Clean Java Language Server Workspace"
   - Reload VS Code

2. **Check Java version:**
   - Terminal: `java -version`
   - Should be Java 17 or later

3. **Verify JAVA_HOME:**
   - Windows: `echo %JAVA_HOME%`
   - Mac/Linux: `echo $JAVA_HOME`

### SQLTools Can't Connect

1. **Verify Docker containers running:** `docker ps`
2. **Check connection settings:**
   - Host: `localhost` (not `postgres`)
   - Port: `5432`
   - Database: `appdb`
3. **Test from terminal:**
   ```powershell
   docker exec -it smart-academic-calendar-db psql -U appuser -d appdb
   ```

### Docker Extension Shows Nothing

1. **Ensure Docker Desktop is running**
2. **Check Docker daemon is running:** `docker info`
3. **Restart Docker Desktop**
4. **Reload VS Code**

---

## Learning Resources

**VS Code Java Documentation:**
https://code.visualstudio.com/docs/java/java-tutorial

**SQLTools Documentation:**
https://vscode-sqltools.mteixeira.dev/

**GitLens Documentation:**
https://gitlens.amod.io/

**Docker Extension Guide:**
https://code.visualstudio.com/docs/containers/overview
