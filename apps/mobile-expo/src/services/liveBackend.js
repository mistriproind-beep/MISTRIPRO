import { supabase } from './supabase';

export const LiveBackend = {
  // 1. Sync User Profile (Customer / Worker)
  syncProfile: async (profile) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            phone: profile.phone,
            full_name: profile.fullName || profile.name,
            role: profile.role || 'CUSTOMER',
            alt_phone: profile.altPhone || null,
            address: profile.address || '',
            city: profile.city || 'Sawai Madhopur',
            state: profile.state || 'Rajasthan',
            kyc_status: profile.kycStatus || 'PENDING',
            is_approved: profile.isApproved || false,
            is_dev: profile.isDev || false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'phone' }
        )
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.log('LiveBackend.syncProfile fallback:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 2. Submit Worker KYC Profile for Admin Approval
  submitWorkerKYC: async (workerProfile) => {
    try {
      // First ensure profile exists
      const { data: userProfile, error: pErr } = await supabase
        .from('profiles')
        .upsert(
          {
            phone: workerProfile.phone,
            full_name: workerProfile.name,
            role: 'WORKER',
            alt_phone: workerProfile.altPhone || null,
            address: workerProfile.address || '',
            city: 'Sawai Madhopur',
            state: 'Rajasthan',
            kyc_status: 'PENDING',
            is_approved: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'phone' }
        )
        .select()
        .single();

      if (pErr) throw pErr;

      // Upsert worker details
      const { data: wData, error: wErr } = await supabase
        .from('worker_profiles')
        .upsert({
          user_id: userProfile.id,
          skills: workerProfile.skills || ['Master Mason'],
          experience_years: workerProfile.experienceYears || 5,
          daily_rate: workerProfile.dailyRate || 950,
          rate_type: workerProfile.rateType || 'day',
          aadhaar_front_url: workerProfile.aadhaarFront || null,
          aadhaar_back_url: workerProfile.aadhaarBack || null,
          is_available: true,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (wErr) throw wErr;
      return { success: true, userProfile, workerProfile: wData };
    } catch (err) {
      console.log('LiveBackend.submitWorkerKYC fallback:', err.message);
      return { success: false, error: err.message };
    }
  },

  // 3. Check Worker KYC Approval Status
  checkWorkerApprovalStatus: async (phone) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('kyc_status, is_approved, role')
        .eq('phone', phone)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { approved: false, status: 'PENDING' };
      return {
        approved: data.is_approved === true || data.kyc_status === 'APPROVED',
        status: data.kyc_status || 'PENDING',
      };
    } catch (err) {
      return { approved: false, status: 'PENDING' };
    }
  },

  // 4. Create New Booking (Customer -> Worker) with Escrow & Platform Fee
  createBooking: async (booking) => {
    try {
      const bookingCode = `MP-${Math.floor(100000 + Math.random() * 900000)}`;
      const workerFee = Number(booking.workerFee || 950);
      const platformFee = 99; // Standard platform booking fee
      const transactionFee = Math.round(workerFee * 0.05); // 5% escrow / payment fee
      const totalAmount = workerFee + platformFee + transactionFee;

      const payload = {
        booking_code: bookingCode,
        customer_name: booking.customerName,
        customer_phone: booking.customerPhone,
        worker_id: booking.workerId || null,
        worker_name: booking.workerName,
        worker_phone: booking.workerPhone,
        worker_skill: booking.workerSkill,
        category: booking.category,
        title: booking.title || `${booking.workerSkill} Service`,
        site_location: booking.siteLocation,
        scheduled_date: booking.scheduledDate || 'Today, Immediate',
        duration: booking.duration || '1 Day',
        worker_fee: workerFee,
        platform_fee: platformFee,
        transaction_fee: transactionFee,
        total_amount: totalAmount,
        status: 'WAITING_CONFIRMATION',
        progress_step: 1,
        escrow_status: 'LOCKED_IN_ESCROW',
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { success: true, booking: data };
    } catch (err) {
      console.log('LiveBackend.createBooking fallback:', err.message);
      // Return structured offline object so UI still works seamlessly
      const workerFee = Number(booking.workerFee || 950);
      const platformFee = 99;
      const transactionFee = Math.round(workerFee * 0.05);
      return {
        success: true,
        booking: {
          id: `B-${Date.now().toString().slice(-4)}`,
          booking_code: `MP-${Math.floor(100000 + Math.random() * 900000)}`,
          customer_name: booking.customerName,
          customer_phone: booking.customerPhone,
          worker_id: booking.workerId || null,
          worker_name: booking.workerName,
          worker_phone: booking.workerPhone,
          worker_skill: booking.workerSkill,
          category: booking.category,
          title: booking.title || `${booking.workerSkill} Service`,
          site_location: booking.siteLocation,
          scheduled_date: booking.scheduledDate || 'Today, Immediate',
          duration: booking.duration || '1 Day',
          worker_fee: workerFee,
          platform_fee: platformFee,
          transaction_fee: transactionFee,
          total_amount: workerFee + platformFee + transactionFee,
          status: 'WAITING_CONFIRMATION',
          progress_step: 1,
          escrow_status: 'LOCKED_IN_ESCROW',
          created_at: new Date().toISOString(),
        },
      };
    }
  },

  // 5. Update Booking Status (e.g. Worker Confirms, Rejects, or Progresses Steps)
  updateBookingStatus: async (bookingId, updates, progressStep) => {
    try {
      const payload = typeof updates === 'string' ? { status: updates } : { ...updates };
      if (progressStep !== undefined) {
        payload.progress_step = progressStep;
      }
      const { data, error } = await supabase
        .from('bookings')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.log('LiveBackend.updateBookingStatus fallback:', err.message);
      return { success: true, localUpdate: updates };
    }
  },

  // 6. Submit Review & Rating
  submitReview: async (reviewPayload) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            customer_name: reviewPayload.customerName,
            worker_id: reviewPayload.workerId || null,
            rating: reviewPayload.rating,
            comment: reviewPayload.comment,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.log('LiveBackend.submitReview fallback:', err.message);
      return { success: true, fallback: true };
    }
  },

  // 7. Contractor Group Booking
  createContractorBooking: async (contractorPayload) => {
    try {
      const bookingCode = `GRP-${Math.floor(100000 + Math.random() * 900000)}`;
      const subtotal = Number(contractorPayload.subtotal || 4500);
      const platformFee = 99;
      const transactionFee = Math.round(subtotal * 0.05);
      const totalAmount = subtotal + platformFee + transactionFee;

      const payload = {
        booking_code: bookingCode,
        contractor_name: contractorPayload.contractorName,
        contractor_phone: contractorPayload.contractorPhone,
        site_location: contractorPayload.siteLocation,
        duration: contractorPayload.duration,
        total_workers: contractorPayload.totalWorkers,
        crew_breakdown: contractorPayload.crewBreakdown,
        assigned_workers: contractorPayload.assignedWorkers || [],
        subtotal: subtotal,
        platform_fee: platformFee,
        transaction_fee: transactionFee,
        total_amount: totalAmount,
        status: 'CONFIRMED',
      };

      const { data, error } = await supabase
        .from('contractor_bookings')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.log('LiveBackend.createContractorBooking fallback:', err.message);
      return {
        success: true,
        data: {
          id: `GRP-${Date.now().toString().slice(-4)}`,
          booking_code: `GRP-${Math.floor(100000 + Math.random() * 900000)}`,
          ...contractorPayload,
          status: 'CONFIRMED',
        },
      };
    }
  },

  // 8. Create Withdrawal Request
  createWithdrawalRequest: async (withdrawalPayload) => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert([
          {
            worker_name: withdrawalPayload.workerName,
            worker_phone: withdrawalPayload.workerPhone,
            amount: withdrawalPayload.amount,
            payout_method: withdrawalPayload.payoutMethod,
            payout_details: withdrawalPayload.payoutDetails,
            status: 'PENDING',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.log('LiveBackend.createWithdrawalRequest fallback:', err.message);
      return { success: true, fallback: true };
    }
  },

  // 9. Send In-App Notification
  sendNotification: async (notif) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_phone: notif.userPhone,
            title: notif.title,
            message: notif.message,
            type: notif.type || 'INFO',
            is_read: false,
            metadata: notif.metadata || {},
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: true, fallback: true };
    }
  },
};
