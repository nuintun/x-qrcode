/**
 * @module selection
 */

export function getSelectionText(): string | void {
  const selection = document.getSelection();

  if (selection !== null) {
    const selectionText = selection.toString();

    selection.removeAllRanges();

    return selectionText;
  }
}
