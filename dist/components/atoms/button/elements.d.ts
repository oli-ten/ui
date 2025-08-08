import type { SubComponent } from '../../../types/svelte.js';
import Root from './elements/button.svelte';
import Group from './elements/group.svelte';
type ButtonType = typeof Root & {
    Group: SubComponent<typeof Group>;
};
declare const Button: ButtonType;
export default Button;
