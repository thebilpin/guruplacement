<html><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>window.FontAwesomeConfig = { autoReplaceSvg: 'nest'};</script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/highcharts-more.js"></script>
    <script src="https://code.highcharts.com/modules/solid-gauge.js"></script>
    
    <style>::-webkit-scrollbar { display: none;}</style>
    <script>tailwind.config = {
  "theme": {
    "extend": {
      "fontFamily": {
        "inter": [
          "Inter",
          "sans-serif"
        ]
      },
      "colors": {
        "rto-blue": "#4F46E5",
        "rto-green": "#10B981",
        "rto-purple": "#8B5CF6",
        "rto-orange": "#F59E0B",
        "rto-red": "#EF4444",
        "rto-light": "#F8FAFC",
        "rto-dark": "#1E293B"
      }
    }
  }
};</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&amp;display=swap"><style>
      body {
        font-family: 'Inter', sans-serif !important;
      }
      
      /* Preserve Font Awesome icons */
      .fa, .fas, .far, .fal, .fab {
        font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands" !important;
      }
    </style><style>
  .highlighted-section {
    outline: 2px solid #3F20FB;
    background-color: rgba(63, 32, 251, 0.1);
  }

  .edit-button {
    position: absolute;
    z-index: 1000;
  }

  ::-webkit-scrollbar {
    display: none;
  }

  html, body {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  </style></head>
<body class="bg-gray-50 font-custom">
    <!-- Sidebar -->
    <div id="sidebar" class="fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-200 z-10">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-100">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-rto-blue rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold text-lg">R</span>
                </div>
                <span class="text-xl font-bold text-gray-900">RTOLink</span>
            </div>
        </div>

        <!-- Navigation -->
        <nav class="p-4 space-y-2">
            <div class="mb-6">
                <div class="flex items-center space-x-3 px-3 py-2 bg-blue-50 rounded-lg text-rto-blue">
                    <i class="fa-solid fa-chart-line w-5"></i>
                    <span class="font-medium">Dashboard</span>
                </div>
            </div>

            <div class="space-y-1">
                <div class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-rto-blue hover:bg-gray-50 rounded-lg cursor-pointer">
                    <i class="fa-solid fa-user w-5"></i>
                    <span>My Profile</span>
                </div>
                <div class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-rto-blue hover:bg-gray-50 rounded-lg cursor-pointer">
                    <i class="fa-solid fa-briefcase w-5"></i>
                    <span>My Placements</span>
                </div>
                <div class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-rto-blue hover:bg-gray-50 rounded-lg cursor-pointer">
                    <i class="fa-solid fa-search w-5"></i>
                    <span>Find Opportunities</span>
                </div>
                <div class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-rto-blue hover:bg-gray-50 rounded-lg cursor-pointer">
                    <i class="fa-solid fa-star w-5"></i>
                    <span>Feedback &amp; Reports</span>
                </div>
                <div class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-rto-blue hover:bg-gray-50 rounded-lg cursor-pointer">
                    <i class="fa-solid fa-certificate w-5"></i>
                    <span>Certificates</span>
                </div>
                <div class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-rto-blue hover:bg-gray-50 rounded-lg cursor-pointer">
                    <i class="fa-solid fa-graduation-cap w-5"></i>
                    <span>Learning Hub</span>
                </div>
                <div class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-rto-blue hover:bg-gray-50 rounded-lg cursor-pointer">
                    <i class="fa-solid fa-heart w-5"></i>
                    <span>Wellness</span>
                </div>
                <div class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-rto-blue hover:bg-gray-50 rounded-lg cursor-pointer">
                    <i class="fa-solid fa-comments w-5"></i>
                    <span>Support</span>
                </div>
                <div class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-rto-blue hover:bg-gray-50 rounded-lg cursor-pointer">
                    <i class="fa-solid fa-robot w-5"></i>
                    <span>AI Assistant</span>
                </div>
            </div>
        </nav>

        <!-- AI Quick Actions -->
        <div class="absolute bottom-20 left-4 right-4">
            <div class="bg-gradient-to-r from-rto-purple to-rto-blue p-4 rounded-lg text-white">
                <div class="flex items-center space-x-2 mb-2">
                    <i class="fa-solid fa-magic-wand-sparkles"></i>
                    <span class="font-medium text-sm">AI Next Step</span>
                </div>
                <p class="text-xs opacity-90">Upload your police check to complete compliance requirements</p>
                <button class="mt-2 bg-white/20 text-white px-3 py-1 rounded text-xs font-medium">Take Action</button>
            </div>
        </div>

        <!-- Footer Info -->
        <div class="absolute bottom-2 left-4 right-4 text-xs text-gray-500 text-center">
            <div>RTOLink Student Portal v2.0</div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="ml-64">
        <!-- Header -->
        <header id="header" class="bg-white border-b border-gray-200 px-8 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <i class="fa-solid fa-bars text-gray-600"></i>
                    <h1 class="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                </div>
                
                <div class="flex items-center space-x-6">
                    <!-- Search -->
                    <div class="relative">
                        <input type="text" placeholder="Search placements, courses..." class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rto-blue w-80">
                        <i class="fa-solid fa-search absolute left-3 top-3 text-gray-400"></i>
                    </div>
                    
                    <!-- Notifications -->
                    <div class="relative">
                        <i class="fa-solid fa-bell text-gray-600 text-xl cursor-pointer"></i>
                        <span class="absolute -top-1 -right-1 bg-rto-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                    </div>
                    
                    <div class="relative">
                        <i class="fa-solid fa-message text-gray-600 text-xl cursor-pointer"></i>
                        <span class="absolute -top-1 -right-1 bg-rto-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">5</span>
                    </div>
                    
                    <!-- User Profile -->
                    <div class="flex items-center space-x-3">
                        <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" alt="Sarah Chen" class="w-10 h-10 rounded-full">
                        <div>
                            <div class="font-medium text-gray-900">Sarah Chen</div>
                            <div class="text-sm text-gray-500">Nursing Student</div>
                        </div>
                        <i class="fa-solid fa-chevron-down text-gray-400"></i>
                    </div>
                </div>
            </div>
        </header>

        <!-- Dashboard Content -->
        <main class="p-8">
            <!-- Welcome Section -->
            <div id="welcome-section" class="bg-gradient-to-r from-rto-blue to-rto-purple rounded-2xl p-8 mb-8 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-3xl font-bold mb-2">Welcome back, Sarah! 👋</h2>
                        <p class="text-blue-100 text-lg">You're doing great! Keep up the momentum on your nursing journey.</p>
                        <div class="flex items-center space-x-6 mt-4">
                            <div class="flex items-center space-x-2">
                                <i class="fa-solid fa-fire text-rto-orange"></i>
                                <span class="font-medium">12 day streak</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <i class="fa-solid fa-star text-rto-orange"></i>
                                <span class="font-medium">Level 3 Student</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-5xl font-bold">85%</div>
                        <div class="text-blue-100">Course Progress</div>
                    </div>
                </div>
            </div>

            <!-- KPI Cards -->
            <div id="kpi-section" class="grid grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-3xl font-bold text-gray-900">156</div>
                            <div class="text-sm text-gray-500 mt-1">Hours Logged</div>
                            <div class="flex items-center mt-2">
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-rto-green h-2 rounded-full" style="width: 78%"></div>
                                </div>
                                <span class="text-xs text-gray-500 ml-2">78%</span>
                            </div>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <i class="fa-solid fa-clock text-rto-green text-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-3xl font-bold text-gray-900">3/4</div>
                            <div class="text-sm text-gray-500 mt-1">Active Placements</div>
                            <div class="flex items-center mt-2">
                                <span class="bg-rto-orange text-white text-xs px-2 py-1 rounded-full">1 Pending</span>
                            </div>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i class="fa-solid fa-briefcase text-rto-blue text-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-3xl font-bold text-gray-900">92%</div>
                            <div class="text-sm text-gray-500 mt-1">Compliance Score</div>
                            <div class="flex items-center mt-2">
                                <span class="bg-rto-red text-white text-xs px-2 py-1 rounded-full">2 Missing</span>
                            </div>
                        </div>
                        <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <i class="fa-solid fa-shield-check text-rto-red text-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-3xl font-bold text-gray-900">4.8</div>
                            <div class="text-sm text-gray-500 mt-1">Average Rating</div>
                            <div class="flex items-center mt-2">
                                <div class="flex text-rto-orange">
                                    <i class="fa-solid fa-star text-xs"></i>
                                    <i class="fa-solid fa-star text-xs"></i>
                                    <i class="fa-solid fa-star text-xs"></i>
                                    <i class="fa-solid fa-star text-xs"></i>
                                    <i class="fa-solid fa-star text-xs"></i>
                                </div>
                            </div>
                        </div>
                        <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <i class="fa-solid fa-star text-rto-orange text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Dashboard Grid -->
            <div class="grid grid-cols-12 gap-6">
                <!-- Progress Overview Chart -->
                <div id="progress-chart-section" class="col-span-8 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div class="p-6 border-b border-gray-100">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900">Learning Progress Overview</h3>
                            <div class="flex space-x-2">
                                <button class="px-3 py-1 text-sm bg-gray-100 rounded-lg">This Week</button>
                                <button class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">This Month</button>
                                <button class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">This Year</button>
                            </div>
                        </div>
                        <div class="mt-2">
                            <span class="text-2xl font-bold text-gray-900">+12%</span>
                            <span class="text-sm text-green-600 ml-2">
                                <i class="fa-solid fa-arrow-up"></i> improvement from last week
                            </span>
                        </div>
                    </div>
                    <div class="p-6">
                        <div id="progress-chart" class="h-80"></div>
                    </div>
                </div>

                <!-- Notifications Feed -->
                <div id="notifications-section" class="col-span-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div class="p-6 border-b border-gray-100">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900">Recent Notifications</h3>
                            <i class="fa-solid fa-bell text-gray-400 cursor-pointer hover:text-rto-blue"></i>
                        </div>
                    </div>
                    <div class="p-6 space-y-4 max-h-96 overflow-y-auto">
                        <div class="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div class="w-8 h-8 bg-rto-blue rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-calendar text-white text-xs"></i>
                            </div>
                            <div class="flex-1">
                                <div class="text-sm font-medium text-gray-900">Placement reminder</div>
                                <div class="text-xs text-gray-600 mt-1">Your shift at City Hospital starts at 8:00 AM tomorrow</div>
                                <div class="text-xs text-gray-400 mt-1">2 hours ago</div>
                            </div>
                        </div>

                        <div class="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                            <div class="w-8 h-8 bg-rto-green rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-check text-white text-xs"></i>
                            </div>
                            <div class="flex-1">
                                <div class="text-sm font-medium text-gray-900">Document approved</div>
                                <div class="text-xs text-gray-600 mt-1">Your immunization record has been verified</div>
                                <div class="text-xs text-gray-400 mt-1">4 hours ago</div>
                            </div>
                        </div>

                        <div class="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                            <div class="w-8 h-8 bg-rto-orange rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-exclamation text-white text-xs"></i>
                            </div>
                            <div class="flex-1">
                                <div class="text-sm font-medium text-gray-900">Action required</div>
                                <div class="text-xs text-gray-600 mt-1">Upload your police check certificate</div>
                                <div class="text-xs text-gray-400 mt-1">1 day ago</div>
                            </div>
                        </div>

                        <div class="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                            <div class="w-8 h-8 bg-rto-purple rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-star text-white text-xs"></i>
                            </div>
                            <div class="flex-1">
                                <div class="text-sm font-medium text-gray-900">New achievement</div>
                                <div class="text-xs text-gray-600 mt-1">You earned the "Dedicated Learner" badge!</div>
                                <div class="text-xs text-gray-400 mt-1">2 days ago</div>
                            </div>
                        </div>

                        <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-message text-white text-xs"></i>
                            </div>
                            <div class="flex-1">
                                <div class="text-sm font-medium text-gray-900">New message</div>
                                <div class="text-xs text-gray-600 mt-1">Supervisor feedback available for review</div>
                                <div class="text-xs text-gray-400 mt-1">3 days ago</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Tasks -->
                <div id="tasks-section" class="col-span-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div class="p-6 border-b border-gray-100">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
                            <button class="text-rto-blue text-sm font-medium">View All</button>
                        </div>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <i class="fa-solid fa-file-upload text-rto-red"></i>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium text-gray-900">Upload Police Check</div>
                                <div class="text-sm text-gray-600">Required for placement approval</div>
                                <div class="text-xs text-red-600 mt-1">
                                    <i class="fa-solid fa-clock"></i> Due in 2 days
                                </div>
                            </div>
                            <button class="bg-rto-red text-white px-3 py-1 rounded text-sm">Upload</button>
                        </div>

                        <div class="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fa-solid fa-clipboard-check text-rto-blue"></i>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium text-gray-900">Complete Module 3 Assessment</div>
                                <div class="text-sm text-gray-600">Fundamentals of Patient Care</div>
                                <div class="text-xs text-blue-600 mt-1">
                                    <i class="fa-solid fa-clock"></i> Due in 5 days
                                </div>
                            </div>
                            <button class="bg-rto-blue text-white px-3 py-1 rounded text-sm">Start</button>
                        </div>

                        <div class="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fa-solid fa-calendar text-rto-green"></i>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium text-gray-900">Schedule Supervisor Meeting</div>
                                <div class="text-sm text-gray-600">Discuss placement progress</div>
                                <div class="text-xs text-green-600 mt-1">
                                    <i class="fa-solid fa-clock"></i> Due in 1 week
                                </div>
                            </div>
                            <button class="bg-rto-green text-white px-3 py-1 rounded text-sm">Schedule</button>
                        </div>

                        <div class="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <i class="fa-solid fa-star text-rto-purple"></i>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium text-gray-900">Submit Placement Reflection</div>
                                <div class="text-sm text-gray-600">Week 3 learning outcomes</div>
                                <div class="text-xs text-purple-600 mt-1">
                                    <i class="fa-solid fa-clock"></i> Due in 10 days
                                </div>
                            </div>
                            <button class="bg-rto-purple text-white px-3 py-1 rounded text-sm">Write</button>
                        </div>
                    </div>
                </div>

                <!-- Calendar View -->
                <div id="calendar-section" class="col-span-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div class="p-6 border-b border-gray-100">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900">This Week's Schedule</h3>
                            <div class="flex items-center space-x-2">
                                <button class="p-1 hover:bg-gray-100 rounded">
                                    <i class="fa-solid fa-chevron-left text-gray-600"></i>
                                </button>
                                <span class="text-sm font-medium text-gray-900">Sep 9-15, 2024</span>
                                <button class="p-1 hover:bg-gray-100 rounded">
                                    <i class="fa-solid fa-chevron-right text-gray-600"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-7 gap-2 mb-4">
                            <div class="text-center text-xs font-medium text-gray-500 py-2">Mon</div>
                            <div class="text-center text-xs font-medium text-gray-500 py-2">Tue</div>
                            <div class="text-center text-xs font-medium text-gray-500 py-2">Wed</div>
                            <div class="text-center text-xs font-medium text-gray-500 py-2">Thu</div>
                            <div class="text-center text-xs font-medium text-gray-500 py-2">Fri</div>
                            <div class="text-center text-xs font-medium text-gray-500 py-2">Sat</div>
                            <div class="text-center text-xs font-medium text-gray-500 py-2">Sun</div>
                        </div>
                        <div class="grid grid-cols-7 gap-2">
                            <div class="p-2 h-20 bg-blue-50 rounded border-l-4 border-rto-blue">
                                <div class="text-xs font-medium text-gray-900">9</div>
                                <div class="text-xs text-rto-blue mt-1">Hospital Shift</div>
                                <div class="text-xs text-gray-500">8AM-4PM</div>
                            </div>
                            <div class="p-2 h-20 rounded">
                                <div class="text-xs font-medium text-gray-900">10</div>
                            </div>
                            <div class="p-2 h-20 bg-green-50 rounded border-l-4 border-rto-green">
                                <div class="text-xs font-medium text-gray-900">11</div>
                                <div class="text-xs text-rto-green mt-1">Theory Class</div>
                                <div class="text-xs text-gray-500">2PM-5PM</div>
                            </div>
                            <div class="p-2 h-20 bg-blue-50 rounded border-l-4 border-rto-blue">
                                <div class="text-xs font-medium text-gray-900">12</div>
                                <div class="text-xs text-rto-blue mt-1">Hospital Shift</div>
                                <div class="text-xs text-gray-500">8AM-4PM</div>
                            </div>
                            <div class="p-2 h-20 bg-purple-50 rounded border-l-4 border-rto-purple">
                                <div class="text-xs font-medium text-gray-900">13</div>
                                <div class="text-xs text-rto-purple mt-1">Assessment</div>
                                <div class="text-xs text-gray-500">10AM-12PM</div>
                            </div>
                            <div class="p-2 h-20 rounded">
                                <div class="text-xs font-medium text-gray-900">14</div>
                            </div>
                            <div class="p-2 h-20 rounded">
                                <div class="text-xs font-medium text-gray-900">15</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div id="quick-actions-section" class="col-span-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div class="p-6 border-b border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    </div>
                    <div class="p-6 grid grid-cols-2 gap-4">
                        <button class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-rto-blue hover:bg-blue-50 transition-colors">
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                                <i class="fa-solid fa-qrcode text-rto-blue text-xl"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-900">QR Check-in</span>
                        </button>

                        <button class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-rto-green hover:bg-green-50 transition-colors">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                                <i class="fa-solid fa-upload text-rto-green text-xl"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-900">Upload Doc</span>
                        </button>

                        <button class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-rto-purple hover:bg-purple-50 transition-colors">
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                                <i class="fa-solid fa-message text-rto-purple text-xl"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-900">Contact Supervisor</span>
                        </button>

                        <button class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-rto-orange hover:bg-orange-50 transition-colors">
                            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                                <i class="fa-solid fa-search text-rto-orange text-xl"></i>
                            </div>
                            <span class="text-sm font-medium text-gray-900">Find Placement</span>
                        </button>
                    </div>
                </div>

                <!-- Performance Metrics -->
                <div id="performance-section" class="col-span-8 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div class="p-6 border-b border-gray-100">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                            <button class="text-rto-blue text-sm font-medium">Export Report</button>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-3 gap-6 mb-6">
                            <div class="text-center">
                                <div id="attendance-gauge" class="h-32"></div>
                                <div class="font-medium text-gray-900 mt-2">Attendance</div>
                            </div>
                            <div class="text-center">
                                <div id="competency-gauge" class="h-32"></div>
                                <div class="font-medium text-gray-900 mt-2">Competency</div>
                            </div>
                            <div class="text-center">
                                <div id="engagement-gauge" class="h-32"></div>
                                <div class="font-medium text-gray-900 mt-2">Engagement</div>
                            </div>
                        </div>
                        <div class="border-t border-gray-100 pt-6">
                            <div id="performance-trend-chart" class="h-48"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity Feed -->
            <div id="activity-feed-section" class="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
                <div class="p-6 border-b border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div class="p-6">
                    <div class="space-y-6">
                        <div class="flex items-start space-x-4">
                            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-check text-rto-green"></i>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center space-x-2">
                                    <span class="font-medium text-gray-900">Completed shift at City Hospital</span>
                                    <span class="text-xs text-gray-500">8 hours</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">Excellent patient care and communication skills demonstrated</div>
                                <div class="text-xs text-gray-400 mt-1">Today at 4:30 PM</div>
                            </div>
                            <div class="flex items-center space-x-1">
                                <div class="flex text-rto-orange">
                                    <i class="fa-solid fa-star text-xs"></i>
                                    <i class="fa-solid fa-star text-xs"></i>
                                    <i class="fa-solid fa-star text-xs"></i>
                                    <i class="fa-solid fa-star text-xs"></i>
                                    <i class="fa-solid fa-star text-xs"></i>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-start space-x-4">
                            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-book text-rto-blue"></i>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center space-x-2">
                                    <span class="font-medium text-gray-900">Completed Module 2: Infection Control</span>
                                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">95%</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">Quiz score: 19/20 - Excellent understanding of protocols</div>
                                <div class="text-xs text-gray-400 mt-1">Yesterday at 2:15 PM</div>
                            </div>
                        </div>

                        <div class="flex items-start space-x-4">
                            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-file-upload text-rto-purple"></i>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center space-x-2">
                                    <span class="font-medium text-gray-900">Uploaded immunization records</span>
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Verified</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">All required vaccinations up to date</div>
                                <div class="text-xs text-gray-400 mt-1">2 days ago at 10:30 AM</div>
                            </div>
                        </div>

                        <div class="flex items-start space-x-4">
                            <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-award text-rto-orange"></i>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center space-x-2">
                                    <span class="font-medium text-gray-900">Earned "Dedicated Learner" badge</span>
                                    <span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Achievement</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">Completed 10 consecutive days of learning activities</div>
                                <div class="text-xs text-gray-400 mt-1">3 days ago at 6:45 PM</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer id="footer" class="px-8 py-4 border-t border-gray-200 bg-white mt-8">
            <div class="text-center text-sm text-gray-500">
                Copyright © RTOLink Student Portal 2025 - Empowering your learning journey
            </div>
        </footer>
    </div>

    <script>
        // Progress Chart
        Highcharts.chart('progress-chart', {
            chart: {
                type: 'area',
                height: 320
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                lineWidth: 0,
                tickWidth: 0
            },
            yAxis: {
                title: {
                    text: null
                },
                gridLineWidth: 1,
                gridLineColor: '#f3f4f6',
                max: 100
            },
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top'
            },
            series: [{
                name: 'Theoretical Knowledge',
                data: [65, 72, 78, 82, 85, 88, 90, 92],
                color: '#4F46E5',
                fillOpacity: 0.3
            }, {
                name: 'Practical Skills',
                data: [45, 58, 65, 72, 78, 82, 85, 88],
                color: '#10B981',
                fillOpacity: 0.3
            }, {
                name: 'Clinical Hours',
                data: [20, 35, 50, 65, 75, 80, 85, 88],
                color: '#F59E0B',
                fillOpacity: 0.3
            }],
            plotOptions: {
                area: {
                    marker: {
                        enabled: false
                    }
                }
            }
        });

        // Attendance Gauge
        Highcharts.chart('attendance-gauge', {
            chart: {
                type: 'solidgauge',
                height: 130
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            pane: {
                center: ['50%', '50%'],
                size: '80%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor: '#f3f4f6',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
            yAxis: {
                min: 0,
                max: 100,
                lineWidth: 0,
                tickPositions: []
            },
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        enabled: true,
                        y: -10,
                        borderWidth: 0,
                        useHTML: true,
                        format: '<div style="text-align:center"><span style="font-size:1.5rem;font-weight:bold;color:#1f2937">{y}%</span></div>'
                    }
                }
            },
            series: [{
                name: 'Attendance',
                data: [96],
                color: '#10B981',
                innerRadius: '60%',
                radius: '100%'
            }]
        });

        // Competency Gauge
        Highcharts.chart('competency-gauge', {
            chart: {
                type: 'solidgauge',
                height: 130
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            pane: {
                center: ['50%', '50%'],
                size: '80%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor: '#f3f4f6',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
            yAxis: {
                min: 0,
                max: 100,
                lineWidth: 0,
                tickPositions: []
            },
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        enabled: true,
                        y: -10,
                        borderWidth: 0,
                        useHTML: true,
                        format: '<div style="text-align:center"><span style="font-size:1.5rem;font-weight:bold;color:#1f2937">{y}%</span></div>'
                    }
                }
            },
            series: [{
                name: 'Competency',
                data: [85],
                color: '#4F46E5',
                innerRadius: '60%',
                radius: '100%'
            }]
        });

        // Engagement Gauge
        Highcharts.chart('engagement-gauge', {
            chart: {
                type: 'solidgauge',
                height: 130
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            pane: {
                center: ['50%', '50%'],
                size: '80%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor: '#f3f4f6',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
            yAxis: {
                min: 0,
                max: 100,
                lineWidth: 0,
                tickPositions: []
            },
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        enabled: true,
                        y: -10,
                        borderWidth: 0,
                        useHTML: true,
                        format: '<div style="text-align:center"><span style="font-size:1.5rem;font-weight:bold;color:#1f2937">{y}%</span></div>'
                    }
                }
            },
            series: [{
                name: 'Engagement',
                data: [92],
                color: '#F59E0B',
                innerRadius: '60%',
                radius: '100%'
            }]
        });

        // Performance Trend Chart
        Highcharts.chart('performance-trend-chart', {
            chart: {
                type: 'line',
                height: 190
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                lineWidth: 0,
                tickWidth: 0
            },
            yAxis: {
                title: {
                    text: null
                },
                gridLineWidth: 1,
                gridLineColor: '#f3f4f6',
                min: 0,
                max: 100
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Overall Performance',
                data: [65, 70, 75, 78, 82, 85, 88, 90],
                color: '#8B5CF6',
                lineWidth: 3,
                marker: {
                    radius: 5,
                    fillColor: '#8B5CF6'
                }
            }],
            plotOptions: {
                line: {
                    marker: {
                        enabled: true
                    }
                }
            }
        });
    </script>

</body></html>