// import { EditorView } from "@codemirror/view";
// import { addFadeIn } from "./fadeInExtension";

// export function setupTypingAnimation(view: EditorView) {
//   let lastUpdate = 0;

//   const handleUpdate = (update) => {
//     if (update.docChanged) {
//       const now = Date.now();
//       if (now - lastUpdate < 100) return;
//       lastUpdate = now;

//       const changes = [];
//       update.changes.iterChanges((fromA, toA, fromB, toB) => {
//         if (fromB !== toB) {
//           changes.push({ from: fromB, to: toB });
//         }
//       });

//       if (changes.length > 0) {
//         view.dispatch({
//           effects: changes.map((change) => addFadeIn.of(change)),
//         });
//       }
//     }
//   };

//   view.dispatch({
//     effects: EditorView.updateListener.of(handleUpdate),
//   });
// }