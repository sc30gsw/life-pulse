export function phaseSchedule(
  targetMinutes: number,
): Array<{ to: "fatburn" | "goal"; afterMinutes: number }> {
  if (targetMinutes >= 720) {
    return [
      { afterMinutes: 720, to: "fatburn" },
      { afterMinutes: targetMinutes, to: "goal" },
    ];
  }

  return [
    { afterMinutes: targetMinutes / 2, to: "fatburn" },
    { afterMinutes: targetMinutes, to: "goal" },
  ];
}
