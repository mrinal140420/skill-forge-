package com.skillforge.services;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service
public class GoogleGenerativeAIService {
    private static final Logger logger = LoggerFactory.getLogger(GoogleGenerativeAIService.class);
    private static final String API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final int DEFAULT_MAX_OUTPUT_TOKENS = 900;
    private static final int MAX_RESPONSE_LENGTH = 2000;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${google.ai.api-key:}")
    private String apiKey;

    @Value("${google.ai.model:gemini-2.5-flash}")
    private String modelName;

    public String generateResponse(String systemPrompt, String userMessage) {
        try {
            String resolvedApiKey = resolveApiKey();
            if (resolvedApiKey.isBlank()) {
                logger.warn("Google AI API key not configured. Falling back to local response generation.");
                return buildFallbackResponse(systemPrompt, userMessage);
            }

            String prompt = systemPrompt + "\n\nStudent question: " + userMessage;
            String response = callGemini(prompt, resolvedApiKey);
            if (response == null || response.isBlank()) {
                return buildFallbackResponse(systemPrompt, userMessage);
            }
            return normalizeResponse(response);
        } catch (Exception exception) {
            logger.error("Error generating Google AI response", exception);
            return buildFallbackResponse(systemPrompt, userMessage);
        }
    }

    public boolean isConfigured() {
        return !resolveApiKey().isBlank();
    }

    public String generateStructuredContent(String systemPrompt, String userMessage) {
        try {
            String resolvedApiKey = resolveApiKey();
            if (resolvedApiKey.isBlank()) {
                return "";
            }

            String prompt = systemPrompt + "\n\nRequest: " + userMessage;
            String response = callGemini(prompt, resolvedApiKey, 2048);
            return response == null ? "" : response.trim();
        } catch (Exception exception) {
            logger.error("Error generating structured Google AI response", exception);
            return "";
        }
    }

    public String getConfigurationStatus() {
        return isConfigured() ? "configured" : "fallback";
    }

    private String callGemini(String prompt, String resolvedApiKey) throws IOException, InterruptedException {
        return callGemini(prompt, resolvedApiKey, DEFAULT_MAX_OUTPUT_TOKENS);
    }

    private String callGemini(String prompt, String resolvedApiKey, int maxOutputTokens) throws IOException, InterruptedException {
        JsonObject generationConfig = new JsonObject();
        generationConfig.addProperty("temperature", 0.3);
        generationConfig.addProperty("maxOutputTokens", maxOutputTokens);

        JsonObject part = new JsonObject();
        part.addProperty("text", prompt);

        JsonArray parts = new JsonArray();
        parts.add(part);

        JsonObject content = new JsonObject();
        content.add("parts", parts);

        JsonArray contents = new JsonArray();
        contents.add(content);

        JsonObject payload = new JsonObject();
        payload.add("contents", contents);
        payload.add("generationConfig", generationConfig);

        String requestUrl = API_BASE_URL
                + URLEncoder.encode(modelName, StandardCharsets.UTF_8)
                + ":generateContent?key="
            + URLEncoder.encode(resolvedApiKey, StandardCharsets.UTF_8);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(requestUrl))
                .timeout(Duration.ofSeconds(20))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            logger.warn("Gemini request failed with status {} and body {}", response.statusCode(), response.body());
            return null;
        }

        JsonObject json = JsonParser.parseString(response.body()).getAsJsonObject();
        JsonArray candidates = json.getAsJsonArray("candidates");
        if (candidates == null || candidates.isEmpty()) {
            return null;
        }

        JsonObject firstCandidate = candidates.get(0).getAsJsonObject();
        JsonObject contentJson = firstCandidate.getAsJsonObject("content");
        if (contentJson == null) {
            return null;
        }

        JsonArray responseParts = contentJson.getAsJsonArray("parts");
        if (responseParts == null || responseParts.isEmpty()) {
            return null;
        }

        JsonObject firstPart = responseParts.get(0).getAsJsonObject();
        return firstPart.has("text") ? firstPart.get("text").getAsString() : null;
    }

    private String buildFallbackResponse(String systemPrompt, String userMessage) {
        String studentName = extractPromptValue(systemPrompt, "Student Name:");
        String courseTitle = extractPromptValue(systemPrompt, "Course Title:");
        String topicSummary = extractPromptValue(systemPrompt, "Course Topics:");
        String greeting = studentName.isBlank() ? "Hi there" : "Hi " + studentName;
        String shortTopic = topicSummary.isBlank() ? courseTitle : topicSummary;

        String lowerMessage = userMessage.toLowerCase();
        String combinedContext = (courseTitle + " " + topicSummary).toLowerCase();
        if (lowerMessage.contains("what is") || lowerMessage.startsWith("define ")) {
            if (containsAny(combinedContext, "cyber security", "cybersecurity", "security")) {
                return greeting + ", cybersecurity is the practice of protecting systems, networks, and data from attacks, misuse, or unauthorized access. In this course, focus first on core ideas like threats, vulnerabilities, and safe security habits.";
            }
            return greeting + ", this topic is a core concept in " + courseTitle + ". Start with its definition, identify one practical example from the lesson, and then connect it to the current module.";
        }
        if (lowerMessage.contains("example") || lowerMessage.contains("how")) {
            return greeting + ", focus on " + shortTopic + " and work through one concrete example from the lesson resources. Review the uploaded notes or video for the exact steps, then try the same pattern on a similar problem.";
        }
        if (lowerMessage.contains("why") || lowerMessage.contains("important")) {
            return greeting + ", this matters because it is part of " + courseTitle + " and supports the later lessons built on the same foundation. Review the current topic first, then connect it to the next module so the progression is clear.";
        }
        return greeting + ", this question fits within " + courseTitle + ". Start with the current topic, identify the main definition and one example, then use the uploaded material to confirm the details before moving on.";
    }

    private boolean containsAny(String value, String... candidates) {
        for (String candidate : candidates) {
            if (value.contains(candidate)) {
                return true;
            }
        }
        return false;
    }

    private String normalizeResponse(String response) {
        String normalized = response.replace("*", " ").replaceAll("\\s+", " ").trim();
        if (normalized.length() <= MAX_RESPONSE_LENGTH) {
            return normalized;
        }
        return trimAtSentenceBoundary(normalized, MAX_RESPONSE_LENGTH);
    }

    private String trimAtSentenceBoundary(String text, int maxLength) {
        if (text == null || text.length() <= maxLength) {
            return text;
        }

        int safeLimit = Math.max(0, maxLength - 3);
        String candidate = text.substring(0, safeLimit);
        int lastSentenceEnd = Math.max(candidate.lastIndexOf('.'), Math.max(candidate.lastIndexOf('!'), candidate.lastIndexOf('?')));
        if (lastSentenceEnd >= 120) {
            return candidate.substring(0, lastSentenceEnd + 1).trim();
        }

        int lastSpace = candidate.lastIndexOf(' ');
        if (lastSpace > 0) {
            candidate = candidate.substring(0, lastSpace);
        }
        return candidate.trim() + "...";
    }

    private String extractPromptValue(String prompt, String label) {
        int start = prompt.indexOf(label);
        if (start < 0) {
            return "";
        }

        int valueStart = start + label.length();
        int valueEnd = prompt.indexOf('\n', valueStart);
        if (valueEnd < 0) {
            valueEnd = prompt.length();
        }
        return prompt.substring(valueStart, valueEnd).trim();
    }

    private String resolveApiKey() {
        if (apiKey != null && !apiKey.isBlank()) {
            return apiKey.trim();
        }

        String envApiKey = System.getenv("GOOGLE_API_KEY");
        if (envApiKey != null && !envApiKey.isBlank()) {
            return envApiKey.trim();
        }

        return loadApiKeyFromDotEnv().orElse("");
    }

    private Optional<String> loadApiKeyFromDotEnv() {
        List<Path> candidates = List.of(
                Paths.get(".env"),
                Paths.get("backend-spring", ".env"),
                Paths.get(System.getProperty("user.dir"), ".env"),
                Paths.get(System.getProperty("user.dir"), "backend-spring", ".env")
        );

        for (Path candidate : candidates) {
            if (!Files.exists(candidate)) {
                continue;
            }

            try {
                for (String line : Files.readAllLines(candidate, StandardCharsets.UTF_8)) {
                    String trimmed = line.trim();
                    if (trimmed.startsWith("GOOGLE_API_KEY=")) {
                        return Optional.of(trimmed.substring("GOOGLE_API_KEY=".length()).trim());
                    }
                }
            } catch (IOException exception) {
                logger.debug("Failed to read {}", candidate, exception);
            }
        }

        return Optional.empty();
    }
}
