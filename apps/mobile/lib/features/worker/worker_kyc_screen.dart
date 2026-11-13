import 'package:flutter/material.dart';
import '../../core/theme.dart';

class WorkerKycScreen extends StatefulWidget {
  const WorkerKycScreen({super.key});

  @override
  State<WorkerKycScreen> createState() => _WorkerKycScreenState();
}

class _WorkerKycScreenState extends State<WorkerKycScreen> {
  final _fullNameController = TextEditingController(text: 'Rajesh Kumar');
  final _phoneController = TextEditingController(text: '+91 98290 44556');
  final _addressController = TextEditingController(text: 'Plot 12, Sanganer, Jaipur, Rajasthan');
  final _pincodeController = TextEditingController(text: '302029');
  final _expController = TextEditingController(text: '8');
  final _wageController = TextEditingController(text: '900');
  String _selectedSkill = 'Mason (राजमिस्त्री)';
  String _idType = 'Aadhaar';
  final _idNumberController = TextEditingController(text: '4912');

  void _submitKyc() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Application Under Review'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Application ID: WP-2026-00125', style: TextStyle(fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('Status: Under Review (24–48 hours)'),
            SizedBox(height: 8),
            Text(
              'Our team will verify your details and documents. You will receive an alert once approved.',
              style: TextStyle(fontSize: 12, color: MistriTheme.textMuted),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Got it'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Worker KYC Verification'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Professional Profile & Verification',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: MistriTheme.textDark),
            ),
            const SizedBox(height: 4),
            const Text(
              'Verified workers get selected faster. Your identity documents are encrypted and kept strictly confidential.',
              style: TextStyle(fontSize: 12, color: MistriTheme.textMuted),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _fullNameController,
              decoration: const InputDecoration(labelText: 'Full Name *'),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _addressController,
              decoration: const InputDecoration(labelText: 'Complete Address *'),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _pincodeController,
                    decoration: const InputDecoration(labelText: 'PIN Code *'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _expController,
                    decoration: const InputDecoration(labelText: 'Years of Exp *'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _wageController,
              decoration: const InputDecoration(
                prefixText: '₹ ',
                labelText: 'Daily Wage Expectation (₹/day)',
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Government ID Verification *',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: MistriTheme.textDark),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: const [
                  Icon(Icons.shield_outlined, color: MistriTheme.primaryBlue),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Aadhaar / Voter ID Document photo attached.\nPrivate details are masked from customers.',
                      style: TextStyle(fontSize: 12, color: MistriTheme.textMuted),
                    ),
                  ),
                  Icon(Icons.check_circle, color: MistriTheme.successGreen),
                ],
              ),
            ),
            const SizedBox(height: 28),
            ElevatedButton(
              onPressed: _submitKyc,
              child: const Text('Submit Verification Application'),
            ),
          ],
        ),
      ),
    );
  }
}
