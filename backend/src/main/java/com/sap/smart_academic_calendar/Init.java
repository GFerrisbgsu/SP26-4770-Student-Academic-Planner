package com.sap.smart_academic_calendar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Init {

	public static void main(String[] args) {
		SpringApplication.run(Init.class, args);
	}

}
