import { fireEvent, render, screen } from "@testing-library/react-native";

import { PrefsProvider } from "@/hooks/useTheme";

import { Button } from "./Button";

async function renderButton(props: Partial<React.ComponentProps<typeof Button>> = {}) {
  return render(
    <PrefsProvider>
      <Button label="Log it" {...props} />
    </PrefsProvider>,
  );
}

describe("Button", () => {
  it("renders its label", async () => {
    await renderButton();
    expect(screen.getByText("Log it")).toBeTruthy();
  });

  it("calls onPress when tapped", async () => {
    const onPress = jest.fn();
    await renderButton({ onPress });
    await fireEvent.press(screen.getByRole("button", { name: "Log it" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const onPress = jest.fn();
    await renderButton({ onPress, disabled: true });
    await fireEvent.press(screen.getByRole("button", { name: "Log it" }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not call onPress while loading, and hides the label", async () => {
    const onPress = jest.fn();
    await renderButton({ onPress, loading: true });
    await fireEvent.press(screen.getByRole("button", { name: "Log it" }));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.queryByText("Log it")).toBeNull();
  });
});
