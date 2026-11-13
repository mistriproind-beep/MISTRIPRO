import 'package:flutter/material.dart';
import '../../core/theme.dart';
import 'worker_kyc_screen.dart';

class WorkerHomeScreen extends StatefulWidget {
  const WorkerHomeScreen({super.key});

  @override
  State<WorkerHomeScreen> createState() => _WorkerHomeScreenState();
}

class _WorkerHomeScreenState extends State<WorkerHomeScreen> {
  int _currentIndex = 0;
  bool _isVerified = true; // In production, retrieved from KYC state

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Worker Hub – MISTRI PRO'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Worker Verification Status Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: _isVerified ? const Color(0xFFDCFCE7) : const Color(0xFFFEF3C7),
              child: Row(
                children: [
                  Icon(
                    _isVerified ? Icons.verified : Icons.hourglass_top,
                    color: _isVerified ? const Color(0xFF15803D) : const Color(0xFFB45309),
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _isVerified
                          ? 'KYC Verified Worker • Eligible to apply for jobs'
                          : 'KYC Under Review • 24–48 hours review SLA',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: _isVerified ? const Color(0xFF15803D) : const Color(0xFF92400E),
                      ),
                    ),
                  ),
                  if (!_isVerified)
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const WorkerKycScreen()),
                        );
                      },
                      child: const Text('View KYC'),
                    ),
                ],
              ),
            ),

            // Earnings Summary Banner (Section 13 of PRD)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: MistriTheme.primaryBlue,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x22263A8B),
                      blurRadius: 10,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'TOTAL RECORDED EARNINGS',
                      style: TextStyle(color: Color(0xFF93C5FD), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      '₹28,500',
                      style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.extrabold),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('This Month: ₹12,000', style: TextStyle(color: Colors.white70, fontSize: 13)),
                        Text('Completed Jobs: 8', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Available Jobs Nearby (Section 8 Layout)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Available Jobs Nearby',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: MistriTheme.textDark),
                  ),
                  const SizedBox(height: 12),

                  // Job Card from Section 8
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x06000000),
                          blurRadius: 8,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEFF6FF),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'MISTRI-26110001',
                                style: TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: MistriTheme.primaryBlue,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF3C7),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'Nearby • 4.5 km away',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFB45309),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          'Residential House Construction',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: MistriTheme.textDark),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Vaishali Nagar, Jaipur • 30 days',
                          style: TextStyle(fontSize: 12, color: MistriTheme.textMuted),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: const [
                            Text(
                              'Required: ',
                              style: TextStyle(fontSize: 13, color: MistriTheme.textMuted),
                            ),
                            Text(
                              'Mason (राजमिस्त्री)',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: MistriTheme.primaryBlue),
                            ),
                            Spacer(),
                            Text(
                              '3 Vacancies',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF15803D)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        ElevatedButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Application Submitted! Customer will review your profile.'),
                                backgroundColor: MistriTheme.successGreen,
                              ),
                            );
                          },
                          child: const Text('VIEW DETAILS & APPLY'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: MistriTheme.primaryBlue,
        unselectedItemColor: const Color(0xFF94A3B8),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Find Work'),
          BottomNavigationBarItem(icon: Icon(Icons.description), label: 'Applications'),
          BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet), label: 'Earnings'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
