/**
 * Scroll to element and highlight it
 */
export const highlightElement = (
  elementId: string,
  options: {
    duration?: number;
    behavior?: 'smooth' | 'auto';
  } = {}
) => {
  const { duration = 2000, behavior = 'smooth' } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`❌ Element with id "${elementId}" not found`);
    return;
  }

  // Scroll to element
  element.scrollIntoView({ behavior, block: 'center' });

  // Add highlight class
  element.classList.add('highlighted');

  // Remove highlight after duration
  setTimeout(() => {
    element.classList.remove('highlighted');
  }, duration);
};

/**
 * Auto-expand element (accordion, card)
 */
export const autoExpandElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`❌ Element with id "${elementId}" not found`);
    return;
  }

  // Trigger click on expandable button
  const expandBtn = element.querySelector('[data-expandable]') as HTMLElement;
  if (expandBtn) {
    expandBtn.click();
    console.log(`✅ Element ${elementId} expanded`);
  }
};

/**
 * Highlight and expand together
 */
export const highlightAndExpand = (elementId: string, autoExpand: boolean = true) => {
  if (autoExpand) {
    autoExpandElement(elementId);
  }
  highlightElement(elementId);
};
