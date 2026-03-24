import { Plus } from 'lucide-react';

export function FloatingAddButton() {
  const handleClick = () => {
    // Placeholder for add functionality
    alert('Add new event or assignment');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-10"
      aria-label="Add new item"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
