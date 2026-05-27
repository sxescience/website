import { LANGUAGE_CODES, type LocalizedString, type OrderedContentItem } from "./types";

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

export function listFromSource(value: unknown, context: string): UnknownRecord[] {
	if (Array.isArray(value)) {
		return list(value, context);
	}

	const wrapped = optionalRecord(value);
	if (wrapped && Array.isArray(wrapped.items)) {
		return list(wrapped.items, `${context}.items`);
	}

	throw new CmsContentError(`CMS data "${context}" must be a list or an object with an items list.`);
}

export function requiredString(value: unknown, context: string): string {
	if (typeof value === "string" && value.trim().length > 0) {
		return value.trim();
	}

	throw new CmsContentError(`CMS field "${context}" must be a non-empty string.`);
}

export function requiredNumber(value: unknown, context: string): number {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	throw new CmsContentError(`CMS field "${context}" must be a valid number.`);
}

export function localizedString(value: unknown, context: string): LocalizedString {
	const row = asRecord(value, context);
	const mapped = {} as LocalizedString;

	for (const language of LANGUAGE_CODES) {
		mapped[language] = requiredString(row[language], `${context}.${language}`);
	}

	return mapped;
}

export function mapOrderedCollection<T extends OrderedContentItem>(
	source: unknown,
	context: string,
	mapper: (row: UnknownRecord, index: number) => T | undefined
): T[] {
	const rows = listFromSource(source, context);
	const mapped: T[] = [];

	for (const [index, row] of rows.entries()) {
		try {
			const item = mapper(row, index);
			if (item) {
				mapped.push(item);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.warn(`[cms] Skipping invalid ${context} item ${index + 1}: ${message}`);
		}
	}

	return mapped.sort((a, b) => a.order - b.order);
}
