export default function Loading() {
  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Skeleton Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-6"></div>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded-lg w-1/3 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
                <div className="h-10 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Skeleton Cards */}
          <div className="flex-1">
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-20"></div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-6 bg-gray-200 rounded-lg w-20"></div>
                      <div className="h-6 bg-gray-200 rounded-lg w-6"></div>
                      <div className="h-6 bg-gray-200 rounded-lg w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                  </div>

                  <div className="mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="h-5 bg-gray-200 rounded-lg w-1/4 mb-3"></div>
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((j) => (
                          <div key={j}>
                            <div className="h-4 bg-gray-200 rounded-lg w-1/2 mb-1"></div>
                            <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded-lg w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 