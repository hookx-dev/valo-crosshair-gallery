import { describe, expect, it } from "vitest";
import {
  firestoreDocsUrl,
  fromFirestoreFields,
  timingSafeEqual,
  toFirestoreFields,
} from "./firestoreAdmin";

describe("toFirestoreFields / fromFirestoreFields", () => {
  it("round-trips a typical crosshair document", () => {
    const doc = {
      id: "user-123",
      name: "Test",
      code: "0;P;c;1",
      proPlayerName: null,
      submittedBy: "匿名",
      tags: ["meme", "practical"],
      status: "pending",
      createdAt: "2026-08-31T00:00:00.000Z",
    };

    const fields = toFirestoreFields(doc);
    expect(fields).toEqual({
      id: { stringValue: "user-123" },
      name: { stringValue: "Test" },
      code: { stringValue: "0;P;c;1" },
      proPlayerName: { nullValue: null },
      submittedBy: { stringValue: "匿名" },
      tags: { arrayValue: { values: [{ stringValue: "meme" }, { stringValue: "practical" }] } },
      status: { stringValue: "pending" },
      createdAt: { stringValue: "2026-08-31T00:00:00.000Z" },
    });

    expect(fromFirestoreFields(fields)).toEqual(doc);
  });

  it("throws for unsupported value types", () => {
    expect(() => toFirestoreFields({ bad: { nested: true } as unknown as string })).toThrow();
  });

  it("reads Firestore's integerValue (string-encoded) back into a number", () => {
    expect(fromFirestoreFields({ n: { integerValue: "42" } })).toEqual({ n: 42 });
  });
});

describe("firestoreDocsUrl", () => {
  it("builds the base documents URL", () => {
    expect(firestoreDocsUrl("my-project")).toBe(
      "https://firestore.googleapis.com/v1/projects/my-project/databases/(default)/documents"
    );
  });

  it("appends the given path", () => {
    expect(firestoreDocsUrl("my-project", "/crosshairs/abc")).toBe(
      "https://firestore.googleapis.com/v1/projects/my-project/databases/(default)/documents/crosshairs/abc"
    );
  });
});

describe("timingSafeEqual", () => {
  it("returns true for identical strings", () => {
    expect(timingSafeEqual("secret-value", "secret-value")).toBe(true);
  });

  it("returns false for different strings of the same length", () => {
    expect(timingSafeEqual("secret-value", "secret-valuf")).toBe(false);
  });

  it("returns false for different lengths without throwing", () => {
    expect(timingSafeEqual("short", "much-longer-value")).toBe(false);
  });

  it("returns false when one side is empty", () => {
    expect(timingSafeEqual("", "anything")).toBe(false);
  });
});
