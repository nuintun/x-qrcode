/**
 * @module message
 */

import { ActionType } from './action';
import { DecodedError, DecodedOk } from './decode';
import { EncodedError, EncodedOk } from './encode';

type EncodeAction =
  // Encode tab link
  | ActionType.ENCODE_TAB_LINK
  // Encode select link
  | ActionType.ENCODE_SELECT_LINK
  // Encode selection text
  | ActionType.ENCODE_SELECTION_TEXT;

type DecodeAction =
  // Decode select image
  | ActionType.DECODE_SELECT_IMAGE
  // Decode select capture area
  | ActionType.DECODE_SELECT_CAPTURE_AREA;

export interface EncodeTextOk extends EncodedOk {
  action: EncodeAction;
}

export interface DecodeImageOk extends DecodedOk {
  action: DecodeAction;
}

export interface EncodeTextError extends EncodedError {
  action: EncodeAction;
}

export interface DecodeImageError extends DecodedError {
  action: DecodeAction;
}

export function sendRequest<M, R>(message: M): Promise<R | null | undefined> {
  return chrome.runtime.sendMessage<M, R | null>(message);
}

export function sendResponse<M, R>(tabId: number, message: M): Promise<R | null | undefined> {
  return chrome.tabs.sendMessage(tabId, message);
}
