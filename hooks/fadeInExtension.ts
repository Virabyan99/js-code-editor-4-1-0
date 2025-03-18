import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";

// Define the effect to mark text for animation
export const addFadeIn = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({ from: change.mapPos(from), to: change.mapPos(to) }),
});

// Define the state field to manage animated decorations
export const fadeInField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(addFadeIn)) {
        const { from, to } = effect.value;
        const fadeInMark = Decoration.mark({
          attributes: { class: "cm-fade-in" },
        });
        decorations = decorations.update({
          add: [fadeInMark.range(from, to)],
        });
      }
    }
    return decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

// CSS for the fade-in and flying animations
export const fadeInTheme = EditorView.theme({
  ".cm-fade-in": {
    animation: "fadeIn 1.2s ease-in, flyIn 0.3s ease-out",
  },
  "@keyframes fadeIn": {
    from: { opacity: "0.6" },
    to: { opacity: "1" },
  },
  "@keyframes flyIn": {
    from: { transform: "translateY(-10px)" },
    to: { transform: "translateY(0)" },
  },
  // Optionally, keep the highlight animation if you like it
  "@keyframes highlight": {
    from: { "background-color": "rgba(255, 255, 0, 0.3)" },
    to: { "background-color": "transparent" },
  },
});

// Combine into a single extension array
export const fadeInExtension = [fadeInField, fadeInTheme];