-- Enable Row Level Security (RLS) on remaining public tables to prevent unauthorized direct REST API access.

ALTER TABLE "SessionLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Enquiry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HealthmateQualification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY;
