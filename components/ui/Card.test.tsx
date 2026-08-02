import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";

import { PrefsProvider } from "@/hooks/useTheme";

import { Card } from "./Card";

describe("Card", () => {
  it("renders its children", async () => {
    await render(
      <PrefsProvider>
        <Card>
          <Text>Envelope content</Text>
        </Card>
      </PrefsProvider>,
    );
    expect(screen.getByText("Envelope content")).toBeTruthy();
  });

  it("accepts an accent color without throwing", async () => {
    await expect(
      render(
        <PrefsProvider>
          <Card accent="#ff0000" padded="sm" radiusSize="pill" />
        </PrefsProvider>,
      ),
    ).resolves.not.toThrow();
  });
});
