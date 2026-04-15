# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in the `ui/` folder.

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- NEVER use the `any` type, under any circumstance. If a type cannot be inferred, use `unknown` and narrow it.
- NEVER use the non-null assertion operator (`!`) to force a nullable value. Handle the `null`/`undefined` case explicitly, or narrow the type via a cast to a known-non-null shape (e.g. cast an `AbstractControl` to the strongly-typed `FormGroup` the validator is attached to).
- Prefer `public const` arrow functions over the `function` declaration syntax for module-level helpers.
- Add JSDoc when it adds value (public APIs, non-obvious behavior, exported helpers). Skip it for self-explanatory code.

## Import ordering

Group imports in this exact order, with a blank line between each group:

1. Angular imports (`@angular/*`)
2. Angular Material imports (`@angular/material/*`, `@angular/cdk/*`)
3. RxJS imports (`rxjs`, `rxjs/*`)

Blank line.

4. Local module imports using path aliases (`@testing`, `@module`, etc.)

Blank line.

5. Relative imports, ordered from farthest to closest: `../../../`, then `../../`, then `../`, then `./`

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.
- Prefer Angular Material components whenever a suitable one exists (buttons, form fields, cards, dialogs, snackbars, etc.) before rolling a custom HTML solution.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Testing

- Use the project `MaterialTesting` helper (`@testing`) to interact with Angular Material components in tests (buttons, form fields, icon buttons, etc.) instead of querying the DOM directly.
- Reach for `HttpTestingController` (+ `provideHttpClientTesting()`) to verify HTTP interactions.
- Use `provideRoutingTesting()` from `@testing` when a component depends on the Router.
- To locate DOM elements in a test, use `fixture.debugElement` (`.query(By.css(...))`, `.queryAll(...)`) rather than `fixture.nativeElement.querySelector(...)`.
- Do not call `await fixture.whenStable()` unless it is actually required (e.g. after a microtask boundary created by an HTTP flush or an async pipe). Avoid it right after `TestBed.createComponent()` or after synchronous signal updates.
- Factorize tests with a `forEach` (table-driven tests) when multiple cases only differ by their inputs/expected outputs, to avoid duplicated test bodies.
