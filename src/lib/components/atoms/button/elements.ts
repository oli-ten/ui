// This file is auto-generated. Do not edit manually.
import type { SubComponent } from '$lib/types/svelte.js';
import Root from './elements/button.svelte';
import Group from './elements/group.svelte';

type ButtonType = typeof Root & {
  Group: SubComponent<typeof Group>;
};

const Button = Root as ButtonType;
Button.Group = Group as ButtonType['Group'];

export default Button;