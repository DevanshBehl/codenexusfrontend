export interface MockUser {
    id: string;
    email: string;
    role: 'STUDENT' | 'UNIVERSITY' | 'COMPANY_ADMIN' | 'RECRUITER';
    cnid?: string;
}

export const MOCK_USERS: Record<string, MockUser & { password: string; token: string; refreshToken: string }> = {
    student: {
        id: 'user-student-001',
        email: 'student@test.dev',
        password: 'password123',
        role: 'STUDENT',
        cnid: 'CNSTU001',
        token: 'mock-student-token-jwt',
        refreshToken: 'mock-student-refresh-token',
    },
    university: {
        id: 'user-univ-001',
        email: 'university@test.dev',
        password: 'password123',
        role: 'UNIVERSITY',
        cnid: 'CNUNIV001',
        token: 'mock-univ-token-jwt',
        refreshToken: 'mock-univ-refresh-token',
    },
    company: {
        id: 'user-company-001',
        email: 'company@test.dev',
        password: 'password123',
        role: 'COMPANY_ADMIN',
        cnid: 'CNCO001',
        token: 'mock-company-token-jwt',
        refreshToken: 'mock-company-refresh-token',
    },
    recruiter: {
        id: 'user-recruiter-001',
        email: 'recruiter@test.dev',
        password: 'password123',
        role: 'RECRUITER',
        cnid: 'CNREC001',
        token: 'mock-recruiter-token-jwt',
        refreshToken: 'mock-recruiter-refresh-token',
    },
};

export const MOCK_DATA = {
    '/auth/login': {
        success: true,
        statusCode: 200,
        message: 'Login successful',
    },
    '/auth/signup': {
        success: true,
        statusCode: 201,
        message: 'Signup successful',
    },
    '/auth/refresh': {
        success: true,
        statusCode: 200,
        message: 'Token refreshed',
    },

    '/user/me': {
        id: 'user-student-001',
        email: 'student@test.dev',
        role: 'STUDENT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: {
            id: 'profile-001',
            userId: 'user-student-001',
            universityId: 'univ-001',
            name: 'Test Student',
            age: 22,
            phone: '+1234567890',
            branch: 'Computer Science',
            cgpa: 8.5,
            specialization: 'AI/ML',
            gender: 'MALE',
            registrationNumber: '2021CS101',
            codeNexusId: 'CNSTU001',
            parentsName: 'Parent Name',
            parentContactNo: '+1234567890',
            parentEmail: 'parent@test.dev',
            address: 'Test Address',
            xSchool: 'XYZ School',
            xPercentage: '90%',
            xiiSchool: 'XYZ College',
            xiiPercentage: '85%',
            otherInfo: '',
            status: 'ACTIVE',
            codeArenaScore: 1250,
            avatarUrl: null,
        },
    },

    '/user/universities': [
        { id: 'univ-001', name: 'Tech University' },
        { id: 'univ-002', name: 'State University' },
        { id: 'univ-003', name: 'National Institute' },
    ],

    '/contests': [
        {
            id: 'contest-001',
            title: 'Google Code Jam 2025',
            description: 'Annual coding competition',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            durationMins: 180,
            timeLimitMinutes: 180,
            languages: ['python', 'java', 'cpp', 'javascript'],
            status: 'UPCOMING',
            company: { name: 'Google', industry: 'Tech' },
            _count: { problems: 5 },
        },
        {
            id: 'contest-002',
            title: 'Microsoft Azure Challenge',
            description: 'Cloud computing contest',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            durationMins: 120,
            timeLimitMinutes: 120,
            languages: ['python', 'java', 'cpp'],
            status: 'UPCOMING',
            company: { name: 'Microsoft', industry: 'Tech' },
            _count: { problems: 4 },
        },
    ],

    '/contests/my': [
        {
            id: 'contest-003',
            title: 'Amazon OA Practice',
            description: 'Practice for Amazon interviews',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            durationMins: 90,
            timeLimitMinutes: 90,
            languages: ['python', 'java', 'cpp'],
            status: 'COMPLETED',
            company: { name: 'Amazon', industry: 'E-commerce' },
            _count: { problems: 3 },
        },
    ],

    '/contests/contest-001': {
        id: 'contest-001',
        title: 'Google Code Jam 2025',
        description: 'Annual coding competition organized by Google',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        durationMins: 180,
        timeLimitMinutes: 180,
        languages: ['python', 'java', 'cpp', 'javascript'],
        status: 'UPCOMING',
        company: { name: 'Google', industry: 'Tech' },
        problems: [
            {
                id: 'prob-001',
                title: 'Two Sum',
                difficulty: 'EASY',
                points: 100,
                statement: 'Given an array of integers, return indices of the two numbers that add up to a specific target.',
                constraints: '2 <= nums.length <= 10^4',
                testCases: [
                    { input: '[2,7,11,15], target=9', expectedOutput: '[0,1]' },
                    { input: '[3,2,4], target=6', expectedOutput: '[1,2]' },
                ],
            },
            {
                id: 'prob-002',
                title: 'Reverse Linked List',
                difficulty: 'MEDIUM',
                points: 200,
                statement: 'Given the head of a singly linked list, reverse the list.',
                constraints: 'The number of nodes in the list is in range [0, 5000].',
                testCases: [
                    { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
                    { input: '[1,2]', expectedOutput: '[2,1]' },
                ],
            },
        ],
    },

    '/problems': {
        problems: [
            { id: 'prob-001', title: 'Two Sum', difficulty: 'EASY', points: 100, contestId: null, _count: { testCases: 10, submissions: 150 } },
            { id: 'prob-002', title: 'Add Two Numbers', difficulty: 'MEDIUM', points: 200, contestId: null, _count: { testCases: 8, submissions: 90 } },
            { id: 'prob-003', title: 'Longest Substring', difficulty: 'HARD', points: 300, contestId: null, _count: { testCases: 12, submissions: 45 } },
            { id: 'prob-004', title: 'Valid Parentheses', difficulty: 'EASY', points: 100, contestId: null, _count: { testCases: 6, submissions: 200 } },
        ],
        pagination: { page: 1, limit: 10, total: 4, totalPages: 1 },
    },

    '/projects': [
        {
            id: 'proj-001',
            studentId: 'user-student-001',
            title: 'E-commerce Platform',
            description: 'Full stack e-commerce with React and Node.js',
            techStack: 'React, Node.js, MongoDB, AWS',
            githubLink: 'https://github.com/test/ecommerce',
            liveLink: 'https://ecommerce.test.dev',
            imageUrl: null,
        },
        {
            id: 'proj-002',
            studentId: 'user-student-001',
            title: 'Task Management App',
            description: 'Real-time task management with collaboration features',
            techStack: 'React, Firebase, Material UI',
            githubLink: 'https://github.com/test/taskapp',
            liveLink: null,
            imageUrl: null,
        },
    ],

    '/webinars': [
        {
            id: 'webinar-001',
            title: 'Introduction to Machine Learning',
            agenda: 'Learn ML basics from industry experts',
            scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            durationMins: 120,
            meetingLink: 'https://meet.test.dev/ml-intro',
            status: 'UPCOMING',
            company: { name: 'NVIDIA', industry: 'AI/ML' },
            targetUniversities: [{ university: { id: 'univ-001', name: 'Tech University' } }],
        },
    ],

    '/webinars/my/list': [
        {
            id: 'webinar-002',
            title: 'Career in Cloud Computing',
            agenda: 'AWS and Azure career paths',
            scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            durationMins: 90,
            meetingLink: 'https://meet.test.dev/cloud',
            status: 'COMPLETED',
            company: { name: 'Amazon', industry: 'Cloud' },
            targetUniversities: [],
        },
    ],

    '/mail/inbox': {
        mails: [
            {
                id: 'mail-001',
                sender_cnid: 'CNCO001',
                sender_name: 'HR Department',
                recipient_cnid: 'CNSTU001',
                recipient_name: 'Test Student',
                subject: 'Welcome to CodeNexus',
                body: 'Welcome to our platform! Start exploring opportunities.',
                sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                is_read: false,
                thread_id: 'thread-001',
                parent_mail_id: null,
            },
            {
                id: 'mail-002',
                sender_cnid: 'CNUNIV001',
                sender_name: 'University Admin',
                recipient_cnid: 'CNSTU001',
                recipient_name: 'Test Student',
                subject: 'Campus Drive Announcement',
                body: 'Google is visiting our campus next week.',
                sent_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                is_read: true,
                thread_id: 'thread-002',
                parent_mail_id: null,
            },
        ],
        total: 2,
        page: 1,
        limit: 20,
    },

    '/mail/sent': {
        mails: [
            {
                id: 'mail-sent-001',
                sender_cnid: 'CNSTU001',
                sender_name: 'Test Student',
                recipient_cnid: 'CNCO001',
                recipient_name: 'HR Department',
                subject: 'Inquiry about Software Engineer Role',
                body: 'I would like to know more about the open positions.',
                sent_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                is_read: true,
                thread_id: 'thread-003',
                parent_mail_id: null,
            },
        ],
        total: 1,
        page: 1,
        limit: 20,
    },

    '/mail/unread-count': { unread_count: 1 },

    '/interviews': [
        {
            id: 'interview-001',
            recruiterId: 'user-recruiter-001',
            studentId: 'user-student-001',
            role: 'Software Engineer',
            scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'TECHNICAL',
            status: 'SCHEDULED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            student: { id: 'user-student-001', name: 'Test Student', branch: 'Computer Science', cgpa: 8.5 },
            recruiter: { name: 'John Recruiter', company: { name: 'Google' } },
            recording: null,
        },
    ],

    '/dashboard/student': {
        profile: {
            name: 'Test Student',
            branch: 'Computer Science',
            cgpa: 8.5,
            university: 'Tech University',
            codeArenaScore: 1250,
            status: 'ACTIVE',
        },
        stats: {
            problemsSolved: 45,
            totalSubmissions: 120,
            accuracy: 78.5,
            globalRank: 156,
            streak: 7,
            applications: 3,
        },
        upcomingContests: [
            { id: 'contest-001', title: 'Google Code Jam 2025', company: 'Google', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), durationMins: 180, problems: 5, status: 'UPCOMING' },
        ],
        upcomingInterviews: [
            { id: 'interview-001', role: 'Software Engineer', type: 'TECHNICAL', scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), company: 'Google', recruiter: 'John Recruiter' },
        ],
        upcomingWebinars: [
            { id: 'webinar-001', title: 'Introduction to Machine Learning', company: 'NVIDIA', scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), durationMins: 120 },
        ],
    },

    '/dashboard/company': {
        profile: {
            name: 'Google',
            industry: 'Tech',
            description: 'Leading tech company',
        },
        stats: {
            partnerUniversities: 5,
            totalStudentsReach: 10000,
            activeContests: 2,
            totalContests: 15,
            scheduledInterviews: 8,
            completedInterviews: 45,
            recruiters: 12,
        },
        partnerUniversities: [
            { id: 'univ-001', name: 'Tech University', location: 'Bangalore', tier: 1, studentCount: 500 },
            { id: 'univ-002', name: 'State University', location: 'Delhi', tier: 2, studentCount: 800 },
        ],
        candidates: [
            { id: 'user-student-001', name: 'Test Student', branch: 'Computer Science', cgpa: 8.5, university: 'Tech University', problemsSolved: 45, status: 'SHORTLISTED' },
        ],
        recentContests: [
            { id: 'contest-past-001', title: 'Google Kick Start', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), durationMins: 180, status: 'COMPLETED', problems: 5 },
        ],
        scheduledInterviews: [
            { id: 'interview-001', role: 'Software Engineer', type: 'TECHNICAL', scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), student: 'Test Student', studentBranch: 'CS', studentUniversity: 'Tech University', recruiter: 'John' },
        ],
    },

    '/dashboard/university': {
        profile: { name: 'Tech University', location: 'Bangalore', tier: 1 },
        stats: {
            totalStudents: 500,
            placedStudents: 150,
            availableStudents: 350,
            placementRate: 30,
            partnerCompanies: 25,
            upcomingDrives: 5,
        },
        students: [
            { id: 'user-student-001', name: 'Test Student', branch: 'Computer Science', cgpa: 8.5, codeArenaScore: 1250, status: 'AVAILABLE', applications: 3, problemsSolved: 45 },
        ],
        topStudents: [
            { id: 'user-student-001', name: 'Test Student', branch: 'Computer Science', cgpa: 8.5, codeArenaScore: 1250 },
        ],
        recentDrives: [
            { id: 'drive-001', title: 'Google Campus Drive', company: 'Google', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), problems: 5, status: 'COMPLETED' },
        ],
        upcomingWebinars: [
            { id: 'webinar-001', title: 'Introduction to Machine Learning', company: 'NVIDIA', scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), durationMins: 120 },
        ],
        pendingRequests: [
            { companyId: 'user-company-001', companyName: 'Amazon', industry: 'E-commerce', description: 'Seeking partnership for campus recruitment', requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        ],
    },

    '/dashboard/recruiter': {
        profile: { name: 'John Recruiter', company: 'Google' },
        stats: {
            totalInterviews: 25,
            scheduledInterviews: 3,
            completedInterviews: 20,
            recordings: 15,
        },
        scheduledInterviews: [
            {
                id: 'interview-001',
                role: 'Software Engineer',
                type: 'TECHNICAL',
                scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                student: {
                    id: 'user-student-001',
                    name: 'Test Student',
                    branch: 'Computer Science',
                    cgpa: 8.5,
                    specialization: 'AI/ML',
                    university: 'Tech University',
                    projects: [
                        { id: 'proj-001', title: 'E-commerce Platform', description: 'Full stack e-commerce', techStack: 'React, Node.js', githubLink: null, liveLink: null },
                    ],
                    solvedProblems: [
                        { title: 'Two Sum', difficulty: 'EASY', topic: 'Arrays' },
                        { title: 'Add Two Numbers', difficulty: 'MEDIUM', topic: 'Linked Lists' },
                    ],
                },
            },
        ],
        recordings: [
            {
                id: 'rec-001',
                recordingId: 'recording-001',
                role: 'Software Engineer',
                type: 'TECHNICAL',
                scheduledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                videoUrl: null,
                duration: '45:30',
                rating: 4,
                verdict: 'SELECTED',
                notes: 'Good problem-solving skills',
                student: {
                    id: 'user-student-002',
                    name: 'Jane Student',
                    branch: 'Information Technology',
                    cgpa: 8.2,
                    university: 'State University',
                    solvedProblems: [{ title: 'Valid Parentheses', difficulty: 'EASY', topic: 'Stacks' }],
                },
            },
        ],
    },

    '/evaluations/company': [
        {
            id: 'eval-001',
            student: 'Test Student',
            university: 'Tech University',
            recruiter: 'John Recruiter',
            role: 'Software Engineer',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            duration: '45 mins',
            rating: 4,
            notes: 'Strong technical skills',
            status: 'PENDING',
            questions: [
                { title: 'Two Sum', testCasesPassed: 10, totalTestCases: 10, codeSubmission: '// solution here', language: 'python' },
            ],
        },
    ],

    '/codearena/problems': {
        problems: [
            { id: 'ca-prob-001', title: 'Palindrome Check', difficulty: 'EASY', tags: ['string'], points: 100 },
            { id: 'ca-prob-002', title: 'Binary Search', difficulty: 'MEDIUM', tags: ['algorithms'], points: 200 },
            { id: 'ca-prob-003', title: 'Dynamic Programming - Fibonacci', difficulty: 'MEDIUM', tags: ['dp'], points: 250 },
        ],
        pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
    },

    '/codearena/leaderboard': {
        entries: [
            { rank: 1, username: 'top_coder', score: 2500, problemsSolved: 120 },
            { rank: 2, username: 'algo_master', score: 2350, problemsSolved: 115 },
            { rank: 3, username: 'Test Student', score: 1250, problemsSolved: 45 },
        ],
    },

    '/partnerships/universities': [
        { id: 'univ-001', name: 'Tech University', location: 'Bangalore', tier: 1 },
        { id: 'univ-002', name: 'State University', location: 'Delhi', tier: 2 },
    ],
};

export function getMockResponse(path: string, method: string, body?: unknown): { success: boolean; statusCode: number; data: unknown; message: string } {
    if (path === '/auth/login' && method === 'POST') {
        const { email, password } = body as { email: string; password: string };
        const mockUser = Object.values(MOCK_USERS).find(u => u.email === email && u.password === password);
        if (mockUser) {
            return {
                success: true,
                statusCode: 200,
                data: {
                    user: { id: mockUser.id, email: mockUser.email, role: mockUser.role, cnid: mockUser.cnid },
                    token: mockUser.token,
                    refreshToken: mockUser.refreshToken,
                },
                message: 'Login successful',
            };
        }
        return { success: false, statusCode: 401, data: null, message: 'Invalid credentials' };
    }

    if (path === '/auth/refresh' && method === 'POST') {
        return {
            success: true,
            statusCode: 200,
            data: { token: 'mock-refreshed-token', refreshToken: 'mock-refreshed-refresh-token' },
            message: 'Token refreshed',
        };
    }

    if (path === '/auth/logout' && method === 'POST') {
        return { success: true, statusCode: 200, data: null, message: 'Logged out successfully' };
    }

    const mockKey = Object.keys(MOCK_DATA).find(key => path.startsWith(key) || path === key);
    if (mockKey) {
        return {
            success: true,
            statusCode: 200,
            data: MOCK_DATA[mockKey as keyof typeof MOCK_DATA],
            message: 'Success',
        };
    }

    return { success: false, statusCode: 404, data: null, message: 'Endpoint not found in mock data' };
}
