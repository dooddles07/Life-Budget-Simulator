import { Component, type ReactNode } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { space } from "@/constants/theme";
import { reportError } from "@/lib/crash-reporter";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    reportError(error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return <Fallback onReset={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}

function Fallback({ onReset }: { onReset: () => void }) {
  return (
    <Screen scroll={false} style={{ alignItems: "center", justifyContent: "center" }}>
      <View style={{ gap: space.md, alignItems: "center" }}>
        <Text variant="h2" center>
          Something went wrong
        </Text>
        <Text variant="body" tone="muted" center>
          The app hit an unexpected error. Try again -- your data is safe.
        </Text>
        <Button label="Try again" variant="surface" onPress={onReset} />
      </View>
    </Screen>
  );
}
