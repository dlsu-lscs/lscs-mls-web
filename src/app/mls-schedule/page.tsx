export default function AddCoursePage() {
  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side: Course Code */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Add Course Code</h2>
          
        </div>

        {/* Right side: Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Schedule</h2>
         
        </div>
      </div>
    </div>
  );
}

