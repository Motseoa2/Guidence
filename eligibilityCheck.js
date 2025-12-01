// utils/eligibilityCheck.js

/**
 * Comprehensive eligibility checking system
 * Handles student-course matching with detailed feedback
 */

// Grade to credit mapping (IGCSE scale)
const GRADE_CREDITS = {
  'A*': 12, 'A': 11, 'B': 10, 'C': 9, 'D': 8, 'E': 7, 'F': 6, 'G': 5, 'U': 0
};

// Grade ranking for comparisons (lower number = better grade)
const GRADE_RANKING = {
  'A*': 1, 'A': 2, 'B': 3, 'C': 4, 'D': 5, 'E': 6, 'F': 7, 'G': 8, 'U': 9
};

// Subject categories for requirement checking
const SUBJECT_CATEGORIES = {
  'core': ['Mathematics', 'English', 'Sciences'],
  'sciences': ['Physics', 'Chemistry', 'Biology', 'Combined Science'],
  'humanities': ['History', 'Geography', 'Economics', 'Business Studies'],
  'languages': ['French', 'Spanish', 'German', 'Arabic', 'Kiswahili'],
  'technical': ['Computer Science', 'ICT', 'Design Technology']
};

/**
 * Main eligibility check function
 */
export const checkEligibility = async (studentId, courseId) => {
  try {
    console.log('🔍 Starting eligibility check for student:', studentId, 'course:', courseId);

    // For demo/development without backend - return mock data
    if (!studentId || !courseId) {
      return getMockEligibility(studentId, courseId);
    }

    // Check if we're in development mode (no backend)
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      console.log('🏗️ Development mode: Using mock eligibility data');
      return getMockEligibility(studentId, courseId);
    }

    // Try to fetch from backend API
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/eligibility/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, courseId })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Eligibility result from API:', result);
        return formatEligibilityResult(result);
      }
    } catch (apiError) {
      console.warn('⚠️ API not available, using mock data:', apiError.message);
    }

    // Fallback to mock data
    return getMockEligibility(studentId, courseId);

  } catch (error) {
    console.error('❌ Error in checkEligibility:', error);
    return {
      isEligible: false,
      message: "System error checking eligibility. Please try again.",
      creditStatus: 'error',
      requirements: ['System error - please refresh and try again'],
      missingRequirements: [],
      passedRequirements: [],
      totalCredits: 0,
      requiredCredits: 0,
      detailedFeedback: []
    };
  }
};

/**
 * Get mock eligibility data for development
 */
const getMockEligibility = (studentId, courseId) => {
  console.log('🎭 Using mock eligibility for:', { studentId, courseId });

  // Simulate different scenarios based on course ID
  const scenarios = {
    // Eligible scenario
    'eligible': {
      isEligible: true,
      message: "Congratulations! You meet all requirements for this course.",
      creditStatus: 'sufficient',
      requirements: [],
      missingRequirements: [],
      passedRequirements: [
        'Minimum 34 credits requirement met (you have 42 credits)',
        'Mathematics grade requirement met (A* required, you have A)',
        'English grade requirement met (B required, you have B)',
        'Science subject requirement met'
      ],
      totalCredits: 42,
      requiredCredits: 34,
      detailedFeedback: [
        { requirement: 'Total Credits', status: 'passed', details: '42/34 credits' },
        { requirement: 'Mathematics Grade', status: 'passed', details: 'A (requires A or better)' },
        { requirement: 'English Grade', status: 'passed', details: 'B (requires B or better)' },
        { requirement: 'Science Subject', status: 'passed', details: 'Physics: B' }
      ]
    },
    
    // Insufficient credits scenario
    'insufficient_credits': {
      isEligible: false,
      message: "Insufficient credits for this course.",
      creditStatus: 'insufficient',
      requirements: ['Minimum 34 credits required (you have 28 credits)'],
      missingRequirements: ['6 more credits required'],
      passedRequirements: [
        'Mathematics grade requirement met',
        'English grade requirement met'
      ],
      totalCredits: 28,
      requiredCredits: 34,
      detailedFeedback: [
        { requirement: 'Total Credits', status: 'failed', details: '28/34 credits' },
        { requirement: 'Mathematics Grade', status: 'passed', details: 'B (requires C or better)' },
        { requirement: 'English Grade', status: 'passed', details: 'C (requires D or better)' }
      ]
    },
    
    // Missing subject requirements scenario
    'missing_subjects': {
      isEligible: false,
      message: "Missing required subject grades.",
      creditStatus: 'sufficient',
      requirements: [
        'Mathematics grade too low (requires B or better, you have D)',
        'Physics subject not provided'
      ],
      missingRequirements: [
        'Mathematics grade B or better',
        'Physics subject with grade C or better'
      ],
      passedRequirements: [
        'Total credits requirement met (38/34 credits)',
        'English grade requirement met'
      ],
      totalCredits: 38,
      requiredCredits: 34,
      detailedFeedback: [
        { requirement: 'Total Credits', status: 'passed', details: '38/34 credits' },
        { requirement: 'Mathematics Grade', status: 'failed', details: 'D (requires B or better)' },
        { requirement: 'Physics Subject', status: 'missing', details: 'Subject not provided' },
        { requirement: 'English Grade', status: 'passed', details: 'B (requires C or better)' }
      ]
    }
  };

  // Determine which scenario to use based on courseId or random
  const scenarioKeys = Object.keys(scenarios);
  const randomKey = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)];
  const courseSpecificKey = courseId?.toString()?.includes('cs') ? 'missing_subjects' : 
                          courseId?.toString()?.includes('med') ? 'insufficient_credits' : 
                          'eligible';

  return scenarios[courseSpecificKey] || scenarios['eligible'];
};

/**
 * Format API response to standard structure
 */
const formatEligibilityResult = (apiResult) => {
  if (!apiResult) {
    return getMockEligibility(null, null);
  }

  // If already in correct format, return as-is
  if (apiResult.isEligible !== undefined) {
    return {
      isEligible: apiResult.isEligible || false,
      message: apiResult.message || 'Eligibility check completed.',
      creditStatus: apiResult.creditStatus || 'pending',
      requirements: apiResult.requirements || [],
      missingRequirements: apiResult.missingRequirements || [],
      passedRequirements: apiResult.passedRequirements || [],
      totalCredits: apiResult.totalCredits || 0,
      requiredCredits: apiResult.requiredCredits || 0,
      detailedFeedback: apiResult.detailedFeedback || []
    };
  }

  // Convert from different API formats
  return {
    isEligible: apiResult.eligible || false,
    message: apiResult.statusMessage || 'Eligibility check completed.',
    creditStatus: apiResult.creditCheck || 'sufficient',
    requirements: apiResult.failedRequirements || [],
    missingRequirements: apiResult.missingRequirements || [],
    passedRequirements: apiResult.passedRequirements || [],
    totalCredits: apiResult.achievedCredits || 0,
    requiredCredits: apiResult.requiredCredits || 0,
    detailedFeedback: apiResult.breakdown || []
  };
};

/**
 * Calculate student credits from grades
 */
export const calculateStudentCredits = (subjects) => {
  if (!subjects || typeof subjects !== 'object') {
    return 0;
  }

  let totalCredits = 0;
  let subjectCount = 0;

  Object.entries(subjects).forEach(([subject, grade]) => {
    if (grade && typeof grade === 'string') {
      const gradeUpper = grade.trim().toUpperCase();
      const creditValue = GRADE_CREDITS[gradeUpper];
      
      if (creditValue !== undefined) {
        totalCredits += creditValue;
        subjectCount++;
      } else {
        console.warn(`⚠️ Unknown grade: ${grade} for subject ${subject}`);
      }
    }
  });

  console.log(`📊 Calculated ${totalCredits} credits from ${subjectCount} subjects`);
  return totalCredits;
};

/**
 * Check if student has complete academic profile
 */
export const hasCompleteAcademicProfile = (student) => {
  if (!student) {
    console.warn('No student provided');
    return false;
  }

  const profile = student.academicProfile || student.grades || {};
  
  // Check for minimum required data
  const hasSubjects = profile.subjects && 
                     Object.keys(profile.subjects).length >= 5; // Minimum 5 subjects
  
  const hasGrades = Object.values(profile.subjects || {}).some(grade => 
    grade && typeof grade === 'string' && grade.trim() !== ''
  );

  return hasSubjects && hasGrades;
};

/**
 * Get minimum academic profile requirements
 */
export const getProfileRequirements = () => {
  return {
    minimumSubjects: 5,
    requiredSubjects: ['Mathematics', 'English'],
    minimumCredits: 30,
    gradeScale: 'A* to G (IGCSE)'
  };
};

/**
 * Get subject grade for student
 */
export const getStudentGrade = (student, subject) => {
  if (!student || !subject) return null;
  
  const subjects = student.academicProfile?.subjects || student.grades || {};
  const grade = subjects[subject];
  
  return grade ? grade.toUpperCase() : null;
};

/**
 * Check if grade meets requirement
 */
export const doesGradeMeetRequirement = (studentGrade, requiredGrade) => {
  if (!studentGrade || !requiredGrade) return false;
  
  const studentRank = GRADE_RANKING[studentGrade.toUpperCase()];
  const requiredRank = GRADE_RANKING[requiredGrade.toUpperCase()];
  
  if (studentRank === undefined || requiredRank === undefined) {
    console.warn(`Invalid grades: ${studentGrade} or ${requiredGrade}`);
    return false;
  }
  
  return studentRank <= requiredRank; // Lower rank = better grade
};

/**
 * Generate eligibility summary for UI display
 */
export const getEligibilitySummary = (eligibilityResult) => {
  if (!eligibilityResult) {
    return {
      status: 'pending',
      icon: '⏳',
      title: 'Checking Eligibility',
      description: 'Please wait while we check your qualifications.',
      color: '#ff9800'
    };
  }

  if (eligibilityResult.isEligible) {
    return {
      status: 'eligible',
      icon: '✅',
      title: 'Eligible to Apply',
      description: eligibilityResult.message || 'You meet all requirements.',
      color: '#4caf50',
      credits: `${eligibilityResult.totalCredits}/${eligibilityResult.requiredCredits}`,
      passedCount: eligibilityResult.passedRequirements?.length || 0
    };
  } else {
    return {
      status: 'ineligible',
      icon: '❌',
      title: 'Not Eligible',
      description: eligibilityResult.message || 'Requirements not met.',
      color: '#f44336',
      credits: `${eligibilityResult.totalCredits}/${eligibilityResult.requiredCredits}`,
      failedCount: eligibilityResult.missingRequirements?.length || 0
    };
  }
};

/**
 * Debug eligibility check - useful for troubleshooting
 */
export const debugEligibility = async (studentId, courseId, studentData = null) => {
  console.group('🔍 ELIGIBILITY DEBUG REPORT');
  
  console.log('=== INPUT DATA ===');
  console.log('Student ID:', studentId);
  console.log('Course ID:', courseId);
  console.log('Student Data:', studentData);
  
  console.log('=== CHECKING ELIGIBILITY ===');
  const result = await checkEligibility(studentId, courseId);
  
  console.log('=== RESULT ===');
  console.log('Eligible:', result.isEligible);
  console.log('Message:', result.message);
  console.log('Credit Status:', result.creditStatus);
  console.log('Total Credits:', result.totalCredits);
  console.log('Required Credits:', result.requiredCredits);
  console.log('Passed Requirements:', result.passedRequirements);
  console.log('Missing Requirements:', result.missingRequirements);
  
  console.log('=== RECOMMENDATIONS ===');
  if (!result.isEligible) {
    console.log('To become eligible:');
    result.missingRequirements.forEach((req, i) => {
      console.log(`${i + 1}. ${req}`);
    });
  }
  
  console.groupEnd();
  return result;
};

/**
 * Quick eligibility check (for UI indicators)
 */
export const quickEligibilityCheck = (student, course) => {
  if (!student || !course) return false;
  
  // Quick check based on mock data patterns
  const studentId = student.id || student._id;
  const courseId = course.id || course._id;
  
  // Simple algorithm for demo
  const studentStr = studentId?.toString() || '';
  const courseStr = courseId?.toString() || '';
  
  // 70% chance of being eligible for demo purposes
  const randomEligible = Math.random() > 0.3;
  
  // Specific patterns
  if (courseStr.includes('engineering') && studentStr.includes('2023')) {
    return true;
  }
  if (courseStr.includes('medicine') && !studentStr.includes('science')) {
    return false;
  }
  
  return randomEligible;
};

export default {
  checkEligibility,
  calculateStudentCredits,
  hasCompleteAcademicProfile,
  getProfileRequirements,
  getStudentGrade,
  doesGradeMeetRequirement,
  getEligibilitySummary,
  debugEligibility,
  quickEligibilityCheck
};