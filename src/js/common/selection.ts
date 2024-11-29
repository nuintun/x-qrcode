/**
 * @module selection
 */

function getSelectionText(): string {
  const selection = document.getSelection();

  if (selection !== null) {
    const selectionText = selection.toString();

    selection.removeAllRanges();

    return selectionText;
  }

  return '';
}

export async function getSelectionsText(tabId: number): Promise<string> {
  const selections = await chrome.scripting.executeScript({
    target: {
      tabId,
      allFrames: true
    },
    func: getSelectionText,
    injectImmediately: true
  });

  return selections.reduce((text, { result }) => {
    return `${text}\r\n${result}`;
  }, '');
}
