#!/usr/bin/env node
// Validates every *.code-snippets file in the repository root.
//
// VS Code parses .code-snippets with a lenient JSONC parser, which means a file
// with a missing comma can fail to load and simply contribute zero snippets --
// silently. That is exactly what happened to unreal-class-actor (uca) and
// unreal-log-cpp (ulc). This script parses with strict JSON.parse so that class
// of breakage fails loudly in CI instead.
//
// Usage: node tools/validate-snippets.mjs

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = readdirSync(repoRoot).filter((f) => f.endsWith('.code-snippets')).sort();

const errors = [];
const prefixOwners = new Map();
let snippetCount = 0;

if (files.length === 0) {
	errors.push('no .code-snippets files found in the repository root');
}

for (const file of files) {
	const raw = readFileSync(join(repoRoot, file), 'utf8');

	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch (err) {
		// Point at the offending line to make a missing comma obvious.
		const offset = Number(/position (\d+)/.exec(err.message)?.[1] ?? NaN);
		const line = Number.isNaN(offset) ? null : raw.slice(0, offset).split('\n').length;
		errors.push(`${file}: invalid JSON${line ? ` at line ${line}` : ''} -- ${err.message}`);
		continue;
	}

	if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
		errors.push(`${file}: top level must be an object of snippet definitions`);
		continue;
	}

	for (const [name, snippet] of Object.entries(parsed)) {
		snippetCount++;
		const where = `${file} -> "${name}"`;

		if (snippet === null || typeof snippet !== 'object' || Array.isArray(snippet)) {
			errors.push(`${where}: snippet must be an object`);
			continue;
		}

		for (const key of ['scope', 'prefix', 'body', 'description']) {
			if (!(key in snippet)) {
				errors.push(`${where}: missing required key "${key}"`);
			}
		}

		if ('body' in snippet) {
			if (!Array.isArray(snippet.body)) {
				errors.push(`${where}: "body" must be an array of strings`);
			} else if (snippet.body.length === 0) {
				errors.push(`${where}: "body" is empty`);
			} else if (!snippet.body.every((l) => typeof l === 'string')) {
				errors.push(`${where}: every "body" entry must be a string`);
			}
		}

		if (typeof snippet.prefix === 'string') {
			const key = `${snippet.scope ?? '*'}:${snippet.prefix}`;
			if (prefixOwners.has(key)) {
				errors.push(`${where}: prefix "${snippet.prefix}" already used by ${prefixOwners.get(key)} in the same scope`);
			} else {
				prefixOwners.set(key, where);
			}
		} else if ('prefix' in snippet) {
			errors.push(`${where}: "prefix" must be a string`);
		}
	}
}

if (errors.length > 0) {
	console.error(`FAIL - ${errors.length} problem(s) across ${files.length} file(s):\n`);
	for (const e of errors) console.error(`  - ${e}`);
	process.exit(1);
}

console.log(`OK - ${snippetCount} snippets across ${files.length} files, all strict-JSON valid.`);
