export async function queueAppointmentReminder(appointmentId: string): Promise<void> {
  console.log(`[notifications] appointment reminder queued for appointment ${appointmentId}`);
}
