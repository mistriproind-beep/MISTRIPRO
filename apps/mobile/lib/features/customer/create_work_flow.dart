import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../core/constants.dart';

class CreateWorkFlowScreen extends StatefulWidget {
  const CreateWorkFlowScreen({super.key});

  @override
  State<CreateWorkFlowScreen> createState() => _CreateWorkFlowScreenState();
}

class _CreateWorkFlowScreenState extends State<CreateWorkFlowScreen> {
  int _currentStep = 0;

  // Step 1: Project Information
  final _titleController = TextEditingController(text: 'House Wall Plastering & Painting');
  final _descController = TextEditingController(text: 'Need 2 experienced masons and 3 labourers for 15 days.');
  String _projectType = 'Residential';

  // Step 2: Location
  final _addressController = TextEditingController(text: 'Plot 18, Gandhi Path, Vaishali Nagar, Jaipur');

  // Step 3: Requirements
  int _masonCount = 2;
  int _labourCount = 3;

  // Step 4: Budget
  final _budgetController = TextEditingController(text: '35000');
  String _paymentBasis = 'Daily';

  // Step 5: Contact
  final _nameController = TextEditingController(text: 'Ramesh Sharma');
  final _phoneController = TextEditingController(text: '+91 98290 12345');

  void _handlePayment() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text('Razorpay Mock Gateway'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Processing Platform Request Listing Fee:'),
            SizedBox(height: 8),
            Text(
              '₹299.00',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: MistriTheme.primaryBlue,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Note: Backend verifies signature cryptographically before publishing tender to matching workers.',
              style: TextStyle(fontSize: 12, color: MistriTheme.textMuted),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: MistriTheme.successGreen),
            onPressed: () {
              Navigator.pop(context); // close dialog
              Navigator.pop(context); // back to customer home
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Payment Verified! Tender MISTRI-26110003 is now Published.'),
                  backgroundColor: MistriTheme.successGreen,
                ),
              );
            },
            child: const Text('Simulate Successful Payment'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Post Work Requirement'),
      ),
      body: Stepper(
        type: StepperType.vertical,
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 5) {
            setState(() => _currentStep += 1);
          } else {
            _handlePayment();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep -= 1);
          } else {
            Navigator.pop(context);
          }
        },
        steps: [
          // Step 1: Project Information
          Step(
            title: const Text('Project Information'),
            isActive: _currentStep >= 0,
            content: Column(
              children: [
                TextField(
                  controller: _titleController,
                  decoration: const InputDecoration(labelText: 'Project Name / Requirement'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _descController,
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'Work Description'),
                ),
              ],
            ),
          ),

          // Step 2: Work Location
          Step(
            title: const Text('Work Location'),
            isActive: _currentStep >= 1,
            content: Column(
              children: [
                TextField(
                  controller: _addressController,
                  decoration: const InputDecoration(
                    labelText: 'Confirm Address',
                    prefixIcon: Icon(Icons.location_pin, color: MistriTheme.accentAmber),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'GPS Pin: 26.9124° N, 75.7873° E (Jaipur)',
                  style: TextStyle(fontSize: 12, color: MistriTheme.textMuted),
                ),
              ],
            ),
          ),

          // Step 3: Worker Requirements
          Step(
            title: const Text('Worker Requirements'),
            isActive: _currentStep >= 2,
            content: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text('Mason (राजमिस्त्री)', style: TextStyle(fontWeight: FontWeight.bold)),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline),
                          onPressed: () => setState(() => _masonCount = (_masonCount > 0 ? _masonCount - 1 : 0)),
                        ),
                        Text('$_masonCount workers', style: const TextStyle(fontWeight: FontWeight.bold)),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline),
                          onPressed: () => setState(() => _masonCount += 1),
                        ),
                      ],
                    ),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text('Construction Labour (मजदूर)', style: TextStyle(fontWeight: FontWeight.bold)),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline),
                          onPressed: () => setState(() => _labourCount = (_labourCount > 0 ? _labourCount - 1 : 0)),
                        ),
                        Text('$_labourCount workers', style: const TextStyle(fontWeight: FontWeight.bold)),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline),
                          onPressed: () => setState(() => _labourCount += 1),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Step 4: Budget
          Step(
            title: const Text('Budget & Duration'),
            isActive: _currentStep >= 3,
            content: TextField(
              controller: _budgetController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                prefixText: '₹ ',
                labelText: 'Total Estimated Budget',
              ),
            ),
          ),

          // Step 5: Contact Details
          Step(
            title: const Text('Contact Details'),
            isActive: _currentStep >= 4,
            content: Column(
              children: [
                TextField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Customer Name'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _phoneController,
                  decoration: const InputDecoration(labelText: 'Verified Mobile'),
                ),
              ],
            ),
          ),

          // Step 6: Review & Payment Summary
          Step(
            title: const Text('Review & Pay ₹299 Listing Fee'),
            isActive: _currentStep >= 5,
            content: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Request Summary', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const Divider(),
                  Text('Project: ${_titleController.text}'),
                  Text('Masons: $_masonCount workers | Labourers: $_labourCount workers'),
                  Text('Estimated Budget: ₹${_budgetController.text}'),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: const [
                      Text('Platform Request Fee:', style: TextStyle(fontWeight: FontWeight.bold)),
                      Text(
                        '₹299',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.extrabold,
                          color: MistriTheme.primaryBlue,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
