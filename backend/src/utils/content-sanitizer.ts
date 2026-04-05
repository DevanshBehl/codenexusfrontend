import { ApiError } from "./api-error.js";

const MAX_BODY_LENGTH = 5000;
const MAX_SUBJECT_LENGTH = 200;

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
const HTML_TAG_REGEX = /<[^>]*>/g;
const ANGLE_BRACKET_REGEX = /<[a-zA-Z][^>]*>/g;

function containsHTMLTags(text: string): boolean {
    return HTML_TAG_REGEX.test(text);
}

function containsSuspiciousAngleBrackets(text: string): boolean {
    const urlMatches = text.match(URL_REGEX) || [];
    let textWithoutUrls = text;
    urlMatches.forEach((url) => {
        textWithoutUrls = textWithoutUrls.replace(url, "");
    });

    const angleBracketPattern = /<[^>]+>/g;
    const matches = textWithoutUrls.match(angleBracketPattern);
    if (!matches) return false;

    for (const match of matches) {
        if (!match.startsWith("http://") && !match.startsWith("https://")) {
            return true;
        }
    }
    return false;
}

function extractUrls(text: string): string[] {
    return text.match(URL_REGEX) || [];
}

function stripHtmlTags(html: string): string {
    return html.replace(HTML_TAG_REGEX, "");
}

export interface SanitizedContent {
    body: string;
    hasUrls: boolean;
    urls: string[];
}

export function sanitizeMailBody(body: string): SanitizedContent {
    if (!body || typeof body !== "string") {
        throw new ApiError(400, "Body is required and must be a string");
    }

    const trimmedBody = body.trim();

    if (trimmedBody.length > MAX_BODY_LENGTH) {
        throw new ApiError(400, `Body must not exceed ${MAX_BODY_LENGTH} characters`);
    }

    const urls = extractUrls(trimmedBody);

    if (containsHTMLTags(trimmedBody)) {
        throw new ApiError(400, "HTML tags are not allowed in mail body");
    }

    if (containsSuspiciousAngleBrackets(trimmedBody)) {
        throw new ApiError(
            400,
            "Angle brackets detected outside of URLs. Only plain text and URLs are allowed."
        );
    }

    const sanitizedBody = stripHtmlTags(trimmedBody);

    return {
        body: sanitizedBody,
        hasUrls: urls.length > 0,
        urls,
    };
}

export function sanitizeMailSubject(subject: string): string {
    if (!subject || typeof subject !== "string") {
        throw new ApiError(400, "Subject is required and must be a string");
    }

    const trimmedSubject = subject.trim();

    if (trimmedSubject.length > MAX_SUBJECT_LENGTH) {
        throw new ApiError(400, `Subject must not exceed ${MAX_SUBJECT_LENGTH} characters`);
    }

    if (containsHTMLTags(trimmedSubject)) {
        throw new ApiError(400, "HTML tags are not allowed in subject");
    }

    return stripHtmlTags(trimmedSubject);
}

export function linkifyBody(body: string): string {
    return body.replace(
        URL_REGEX,
        '<a href="$&" target="_blank" rel="noopener noreferrer">$&</a>'
    );
}
