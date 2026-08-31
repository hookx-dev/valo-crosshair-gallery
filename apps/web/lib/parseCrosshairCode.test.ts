import { describe, expect, it } from "vitest";
import {
  DEFAULT_CROSSHAIR_STATE,
  colorToHex,
  parseCrosshairCode,
  serializeCrosshairState,
} from "./parseCrosshairCode";

describe("parseCrosshairCode", () => {
  it("falls back to defaults when no params are present", () => {
    const state = parseCrosshairCode("0;P");
    expect(state).toEqual(DEFAULT_CROSSHAIR_STATE);
  });

  it("reads simple top-level params", () => {
    const state = parseCrosshairCode("0;P;c;7;h;0;d;1;z;4;a;0.5");
    expect(state.color).toBe("7");
    expect(state.outlinesEnabled).toBe(false);
    expect(state.dotEnabled).toBe(true);
    expect(state.dotThickness).toBe(4);
    expect(state.dotOpacity).toBe(0.5);
  });

  it("treats an explicit 0b=0 as disabling the inner line, but omitted b as enabled", () => {
    expect(parseCrosshairCode("0;P;0b;0").inner.enabled).toBe(false);
    expect(parseCrosshairCode("0;P;1b;0").outer.enabled).toBe(false);
    expect(parseCrosshairCode("0;P").inner.enabled).toBe(true);
  });

  it("ignores vertical length unless the link-sliders flag (g) is set", () => {
    const linked = parseCrosshairCode("0;P;0l;6;0v;12");
    expect(linked.inner.length).toBe(6);
    expect(linked.inner.verticalLength).toBe(6);

    const unlinked = parseCrosshairCode("0;P;0l;6;0v;12;0g;1");
    expect(unlinked.inner.length).toBe(6);
    expect(unlinked.inner.verticalLength).toBe(12);
  });

  it("clamps out-of-range values to the documented min/max", () => {
    const state = parseCrosshairCode("0;P;0l;999;0t;-5;1o;999");
    expect(state.inner.length).toBe(20); // inner length max
    expect(state.inner.thickness).toBe(0); // clamped to min
    expect(state.outer.gap).toBe(40); // outer gap max
  });

  it("parses a valid 6-8 digit custom hex color and uppercases it", () => {
    const state = parseCrosshairCode("0;P;c;8;u;aabbccff");
    expect(state.color).toBe("8");
    expect(state.customHex).toBe("AABBCC");
  });

  it("falls back to the default custom hex for a malformed u param", () => {
    const state = parseCrosshairCode("0;P;c;8;u;nothex");
    expect(state.customHex).toBe(DEFAULT_CROSSHAIR_STATE.customHex);
  });

  it("round-trips through serializeCrosshairState for the default state", () => {
    const code = serializeCrosshairState(DEFAULT_CROSSHAIR_STATE);
    expect(parseCrosshairCode(code)).toEqual(DEFAULT_CROSSHAIR_STATE);
  });

  it("round-trips an unlinked vertical length (builder's 'Link sliders' off)", () => {
    const state = {
      ...DEFAULT_CROSSHAIR_STATE,
      inner: { ...DEFAULT_CROSSHAIR_STATE.inner, length: 6, verticalLength: 12 },
    };
    const code = serializeCrosshairState(state);
    expect(parseCrosshairCode(code).inner.verticalLength).toBe(12);
  });
});

describe("colorToHex", () => {
  it("resolves a preset color number to its hex value", () => {
    expect(colorToHex("7")).toBe("#FF0000");
  });

  it("uses customHex when color is 8 (Custom)", () => {
    expect(colorToHex("8", "112233")).toBe("#112233");
  });

  it("falls back to Green for an unknown color number", () => {
    expect(colorToHex("99")).toBe(colorToHex("1"));
  });
});
