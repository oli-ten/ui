import fs from 'fs';
import path from 'path';

/**
 * Convert kebab or snake case to PascalCase.
 */
function toPascalCase(name) {
	return name
		.split(/[-_]/)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');
}

const baseDir = 'src/lib/components';

/**
 * Recursively find components with `elements` directories.
 * A valid "root" file is now `<foldername>.svelte`.
 */
function findComponents(dir = baseDir) {
	const components = [];

	fs.readdirSync(dir).forEach((item) => {
		const itemPath = path.join(dir, item);
		if (!fs.statSync(itemPath).isDirectory()) return;

		const elementsPath = path.join(itemPath, 'elements');
		if (fs.existsSync(elementsPath) && fs.statSync(elementsPath).isDirectory()) {
			const files = fs.readdirSync(elementsPath).filter((file) => file.endsWith('.svelte'));
			const folderName = path.basename(itemPath);
			const rootFile = files.find((f) => f === `${folderName}.svelte`) || null;
			const subComponents = files.map((file) => path.basename(file, '.svelte'));

			components.push({ dir: itemPath, subComponents, rootFile });
		} else {
			components.push(...findComponents(itemPath));
		}
	});

	return components;
}

function ensureFolderFile(componentDir) {
	const folderFile = path.join(componentDir, `elements.ts`);
	if (!fs.existsSync(folderFile)) {
		fs.writeFileSync(folderFile, 'export {};', 'utf-8');
		console.log(`Ensured folder file exists: ${folderFile}`);
	}
}

function generateRootComponentFile(componentDir, subComponents, rootFile) {
	const folderName = path.basename(componentDir);
	const componentName = toPascalCase(folderName);
	const outputFile = path.join(componentDir, `elements.ts`);

	const subComponentImports = subComponents
		.filter((name) => name !== folderName)
		.map((name) => `import ${toPascalCase(name)} from './elements/${name}.svelte';`)
		.join('\n');

	const subComponentAssignments = subComponents
		.filter((name) => name !== folderName)
		.map(
			(name) =>
				`${componentName}.${toPascalCase(name)} = ${toPascalCase(name)} as ${componentName}Type['${toPascalCase(name)}'];`
		)
		.join('\n');

	const fileContent = `
// This file is auto-generated. Do not edit manually.
import type { SubComponent } from '$lib/types/svelte.js';
import Root from './elements/${rootFile}';
${subComponentImports}

type ${componentName}Type = typeof Root & {
${subComponents
	.filter((name) => name !== folderName)
	.map((name) => `  ${toPascalCase(name)}: SubComponent<typeof ${toPascalCase(name)}>;`)
	.join('\n')}
};

const ${componentName} = Root as ${componentName}Type;
${subComponentAssignments}

export default ${componentName};
`.trim();

	fs.writeFileSync(outputFile, fileContent, 'utf-8');
	console.log(`Generated component file with root: ${outputFile}`);
}

function generateExportFile(componentDir, subComponents) {
	const exportFile = path.join(componentDir, 'elements/__index__.ts');

	const header = `// This file is auto-generated. Do not edit manually.\n`;
	const exports = subComponents
		.map((name) => `export { default as ${toPascalCase(name)} } from './${name}.svelte';`)
		.join('\n');

	const exportContent = `${header}${exports}`;

	fs.writeFileSync(exportFile, exportContent, 'utf-8');
	console.log(`Generated export file: ${exportFile}`);
}

function generateFolderExportFile(componentDir) {
	const folderFile = path.join(componentDir, `elements.ts`);
	const fileContent = `// This file is auto-generated. Do not edit manually.
export * as default from './elements/__index__.js';`;

	fs.writeFileSync(folderFile, fileContent, 'utf-8');
	console.log(`Generated folder export file: ${folderFile}`);
}

export async function generateComponents() {
	console.log('Starting component generation process...');
	const components = findComponents();

	if (components.length === 0) {
		console.log('No valid components found.');
		return;
	}

	for (const { dir, subComponents, rootFile } of components) {
		ensureFolderFile(dir);
		if (rootFile) {
			console.log(`Processing ${dir} with root file: ${rootFile}`);
			generateRootComponentFile(dir, subComponents, rootFile);
		} else {
			console.log(`Processing ${dir} with no root file`);
			generateExportFile(dir, subComponents);
			generateFolderExportFile(dir);
		}
	}

	console.log('Component generation completed.');
}

// Uncomment to run directly:
// generateComponents();