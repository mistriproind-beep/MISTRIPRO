import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  Trash2,
} from 'lucide-react-native';

export default function NotificationCenterModal({
  visible,
  onClose,
  notifications = [],
  onDismissNotification,
  onClearAll,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Bell size={18} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.title}>Notifications</Text>
                <Text style={styles.sub}>
                  {notifications.length} {notifications.length === 1 ? 'alert' : 'alerts'} received
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              {notifications.length > 0 && (
                <TouchableOpacity style={styles.clearAllBtn} onPress={onClearAll}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Bell size={32} color="#CBD5E1" />
                </View>
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptySub}>
                  You're all caught up! Live booking confirmations, progress alerts, and payout updates will appear here.
                </Text>
              </View>
            ) : (
              notifications.map((item) => (
                <View key={item.id} style={styles.notifCard}>
                  <View style={styles.notifIconWrap}>
                    {item.type === 'SUCCESS' || item.type === 'BOOKING' ? (
                      <CheckCircle2 size={16} color="#15803D" />
                    ) : item.type === 'ALERT' ? (
                      <AlertCircle size={16} color="#DC2626" />
                    ) : item.type === 'ESCROW' ? (
                      <ShieldCheck size={16} color="#4F46E5" />
                    ) : (
                      <Briefcase size={16} color="#2563EB" />
                    )}
                  </View>

                  <View style={styles.notifContent}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifMessage}>{item.message}</Text>
                    <Text style={styles.notifTime}>{item.time || 'Just now'}</Text>
                  </View>

                  {/* Dismiss / Cancel button on each card */}
                  <TouchableOpacity
                    style={styles.dismissBtn}
                    onPress={() => onDismissNotification && onDismissNotification(item.id)}
                    activeOpacity={0.7}
                  >
                    <X size={14} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheetContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  sub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clearAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#DC2626',
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  notifIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexShrink: 0,
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  notifMessage: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
  notifTime: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  dismissBtn: {
    padding: 4,
    flexShrink: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  emptySub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
});
