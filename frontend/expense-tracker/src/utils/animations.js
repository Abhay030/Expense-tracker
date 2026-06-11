// Shared framer-motion animation variants for the Midnight Aurora theme

// Page transition — used in AnimatePresence route changes
export const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// Staggered list — container
export const staggerContainer = {
    animate: { transition: { staggerChildren: 0.06 } },
};

// Staggered list — each child item
export const staggerItem = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// Card hover lift
export const cardHover = {
    whileHover: { y: -3, transition: { duration: 0.2 } },
};

// Modal overlay
export const modalOverlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

// Modal content with spring
export const modalContentVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } },
};

// Fade in only
export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
};
