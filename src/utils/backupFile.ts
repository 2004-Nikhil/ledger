import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

function backupFileName(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `ledger-backup-${stamp}.json`;
}

/** Writes the JSON string to a local file and returns its URI. */
export async function writeBackupFile(json: string): Promise<string> {
  const directory = FileSystem.documentDirectory;
  if (!directory) {
    throw new Error("No writable directory available on this device.");
  }
  const uri = directory + backupFileName();
  await FileSystem.writeAsStringAsync(uri, json);
  return uri;
}

/** Opens the OS share sheet on the given file — the user picks Drive, Files, email, etc. themselves. */
export async function shareBackupFile(uri: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing isn't available on this device.");
  }
  await Sharing.shareAsync(uri, {
    mimeType: "application/json",
    dialogTitle: "Save Ledger backup",
  });
}

/**
 * Opens the system file picker for a .json file. Returns null if the
 * person cancelled — that's a normal outcome, not an error.
 */
export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
}

export async function readBackupFile(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri);
}
