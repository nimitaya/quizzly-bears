/**
 * Simple manager to track and control behavior during navigation
 */
class NavigationStateManager {
  private isNavigatingToAuth = false;
  private isAuthNavigationActive = false;
  private navigationTimeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Call this before navigating to auth screens
   * to prevent socket disconnection
   */
  startAuthNavigation(): void {
    console.log("⚡ Starting auth navigation - preserving socket");
    this.isNavigatingToAuth = true;
    this.isAuthNavigationActive = true;

    // Clear any existing timeout
    if (this.navigationTimeoutId) {
      clearTimeout(this.navigationTimeoutId);
    }

    // Set a longer safety timeout (5 seconds should cover most navigation cases)
    this.navigationTimeoutId = setTimeout(() => {
      console.log("⚠️ Auth navigation safety timeout elapsed");
      this.isNavigatingToAuth = false;
    }, 5000);
  }

  /**
   * Check if we're currently navigating to auth screens
   */
  isInAuthNavigation(): boolean {
    return this.isNavigatingToAuth || this.isAuthNavigationActive;
  }

  /**
   * Call this when auth navigation is complete
   */
  endAuthNavigation(): void {
    console.log("⚡ Auth navigation complete");
    this.isNavigatingToAuth = false;

    // Keep the active state for a short period to handle any cleanup operations
    setTimeout(() => {
      this.isAuthNavigationActive = false;
    }, 500);

    // Clear any pending timeout
    if (this.navigationTimeoutId) {
      clearTimeout(this.navigationTimeoutId);
      this.navigationTimeoutId = null;
    }
  }
}

export const navigationState = new NavigationStateManager();
