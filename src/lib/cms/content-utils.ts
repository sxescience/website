import { LANGUAGE_CODES, type LocalizedString } from "./types";

export type UnknownRecord = Record<string, unknown>;

export class CmsContentError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "CmsContentError";
	}
}

export function asRecord(value: unknown, context: string): UnknownRecord {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new CmsContentError(`CMS data "${context}" must be an object.`);
	}

	return value as UnknownRecord;
}

export function optionalRecord(value: unknown): UnknownRecord | undefined {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return undefined;
	}

	return value as UnknownRecord;
}

export function list(value: unknown, context: string): UnknownRecord[] {
	if (!Array.isArray(value)) {
		throw new CmsContentError(`CMS field "${context}" must be a list.`);
	}

	return value.map((entry, index) => asRecord(entry, `${context}[${index}]`));
}

export function optionalList(value: unknown, context: string): UnknownRecord[] {
	if (value === undefined || value === null) {
		return [];
	}

	return list(value, context);
}

export function requiredString(value: unknown, context: string): string {
	if (typeof value === "string" && value.trim().length > 0) {
		return value.trim();
	}

	throw new CmsContentError(`CMS field "${context}" must be a non-empty string.`);
}

export function optionalString(value: unknown): string {
	if (typeof value !== "string") {
		return "";
	}

	return value.trim();
}

export function localizedString(value: unknown, context: string): LocalizedString {
	const row = asRecord(value, context);
	const mapped = {} as LocalizedString;

	for (const language of LANGUAGE_CODES) {
		mapped[language] = requiredString(row[language], `${context}.${language}`);
	}

	return mapped;
}
