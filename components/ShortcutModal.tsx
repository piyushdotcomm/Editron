"use client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const shortcuts = [
  {
    category: "Editor",
    items: [
      { key: "Ctrl + S", action: "Save file" },
      { key: "Ctrl + Z", action: "Undo" },
      { key: "Ctrl + Shift + Z", action: "Redo" },
    ],
  },
  {
    category: "Navigation",
    items: [
      { key: "Ctrl + P", action: "Open file" },
      { key: "Ctrl + B", action: "Toggle sidebar" },
    ],
  },
  {
    category: "Terminal",
    items: [
      { key: "Ctrl + `", action: "Open terminal" },
    ],
  },
];

export default function ShortcutModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>Keyboard Shortcuts</h2>

        {shortcuts.map((section) => (
          <div key={section.category}>
            <h3>{section.category}</h3>

            {section.items.map((item, i) => (
              <div key={i} style={row}>
                <span>{item.action}</span>
                <kbd>{item.key}</kbd>
              </div>
            ))}
          </div>
        ))}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "400px",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};