import { generateComponents } from './nested.mjs';
import { importComponents } from './single.mjs';

// Execute the script

(async () => {
	await generateComponents();
})();
importComponents();