//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useEffect } from "react";

/**
 * Fabric can inject `data-appearance="dark"` into the iframe host document.
 * This app intentionally renders with its own light palette, so the
 * hook exposes a stable light-mode contract and defensively removes Tailwind's
 * `.dark` class if the host or browser state adds it later.
 */
export function useAppTheme() {
  useEffect(() => {
    const forceLightTheme = () => {
      document.documentElement.classList.remove("dark");
    };

    forceLightTheme();

    const observer = new MutationObserver(forceLightTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-appearance"],
    });

    return () => observer.disconnect();
  }, []);

  return {
    isDark: false,
    toggleTheme: () => undefined,
  };
}
