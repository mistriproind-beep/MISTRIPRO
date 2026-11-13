import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../role/role_select_screen.dart';

class LoginScreen extends StatefulWidget {
  final String selectedLocale;
  const LoginScreen({super.key, required this.selectedLocale});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  bool _isLoading = false;

  void _handleDevLogin() {
    setState(() => _isLoading = true);
    // Simulate fast dev authentication with abc/1234
    Future.delayed(const Duration(milliseconds: 600), () {
      setState(() => _isLoading = false);
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => const RoleSelectScreen(isDevAccount: true),
        ),
      );
    });
  }

  void _handlePhoneLogin() {
    if (_phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid mobile number')),
      );
      return;
    }
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => const RoleSelectScreen(isDevAccount: false),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Authentication'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 12),
            const Text(
              'Sign in to MISTRI PRO',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: MistriTheme.textDark,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Enter your mobile number to get an instant verification code.',
              style: TextStyle(
                fontSize: 14,
                color: MistriTheme.textMuted,
              ),
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.phone_android, color: MistriTheme.primaryBlue),
                prefixText: '+91 ',
                labelText: 'Mobile Number',
                hintText: '98290 12345',
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _handlePhoneLogin,
              child: const Text('Send Verification OTP'),
            ),
            const SizedBox(height: 36),

            // Development Test Account Box (PRD Section 2)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFF59E0B)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.developer_mode, color: Color(0xFFB45309), size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Development Test Account',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF92400E),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Username: abc  |  Password: 1234\nInstant bypass for rapid testing across all roles.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF78350F)),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        side: const BorderSide(color: Color(0xFFD97706), width: 1.5),
                        foregroundColor: const Color(0xFF92400E),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      onPressed: _isLoading ? null : _handleDevLogin,
                      child: _isLoading
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text(
                              'One-Click Dev Login (abc / 1234)',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
