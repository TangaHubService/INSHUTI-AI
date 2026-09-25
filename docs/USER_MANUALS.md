# Inshuti user manual

Inshuti is a sexual and reproductive health platform for young people in Rwanda. It combines anonymous AI chat, reviewed health articles, a facility directory, private follow-up with approved health workers, and separate portals for parents, professionals, government planners, and administrators.

The interface is available in **English**, **Kinyarwanda**, **French**, and **Kiswahili**. Switch language from the language control in the site header (public pages) or from the top bar inside a signed-in workspace.

This manual describes what each person can do in the product. It is not a clinical protocol and it is not a substitute for local emergency care.

---

## 1. What Inshuti is — and what it is not

Inshuti gives general, judgment-free health information. Answers come from an AI assistant that is grounded in a professional-reviewed knowledge base when reviewed articles exist for the topic.

Inshuti does **not**:

- Diagnose illness or prescribe treatment.
- Replace a clinic visit, a midwife, a doctor, or emergency services.
- Show a parent the private consultation of a young person.
- Show government users individual names, messages, or case notes.
- Let administrators read the text of a private consultation. Oversight shows status, priority, and participant names only.

**If you or someone else is in immediate danger**, use the crisis contacts shown in the app, call local emergency services, or go to the nearest health facility. Do not wait for an AI reply or for a professional to come online.

---

## 2. Who uses Inshuti

| Person | Account needed? | Where they land after login |
| --- | --- | --- |
| Visitor | No | Home page and Chat |
| Teenager / user | Optional | Dashboard (`/dashboard`) |
| Parent or guardian | Yes | Parent portal (`/parent`) |
| Healthcare professional | Yes, and administrator approval before cases are assigned | Professional portal (`/professional`) |
| Government user | Yes | Government portal (`/government`) |
| Moderator, content reviewer, or super administrator | Separate admin account | Admin dashboard (`/admin/dashboard`) |

Public registration offers four roles: **Teenager / User** (described as ages 10–19), **Parent / Guardian**, **Healthcare Professional** (requires approval), and **Government User** (requires a government level and region).

Healthcare professional types are: Community Health Worker (CHW), Nurse, Midwife, Psychologist, and Doctor.

Government levels are: National, Provincial, District, Sector, and Cell.

Admin roles, created only by a super administrator, are: **Moderator**, **Content Reviewer**, and **Super Admin**.

---

## 3. Getting started

### 3.1 Use the site without an account

1. Open the home page.
2. Choose **Chat with Inshuti**, or open a topic card (**Menstrual Health**, **Pregnancy**, **Relationships**, **Family Planning**, **HIV & STIs**, **Mental Health**). A topic card starts a chat with a starter question in your current language.
3. You can also open **Find Care**, the public **Library**, **About**, **Services**, **FAQ**, **Contact**, **Privacy**, and **Terms** without signing in.

Anonymous chat is tied to a random session stored in a cookie on that browser. It is not tied to your name or email. Clearing the browser’s cookies, or using **Clear chat history** in Settings or My Space, removes the conversation list for that browser session. The conversation is still stored on the server under that session until it is cleared or removed by retention rules.

### 3.2 Create an account

1. Open **Register** from the header.
2. Choose the role that describes you.
3. Enter full name, email, preferred language, and a password.
4. Password rules: at least 8 characters, and it must contain both a letter and a number.
5. Healthcare professionals also choose a professional type and may add a specialization.
6. Government users choose a level and must enter a region or district name.
7. Submit **Create account**. You are signed in and taken to the portal for your role.

You can still use Chat without registering. An account is what lets you keep appointments, request a named professional follow-up, receive notifications, and use My Space.

### 3.3 Sign in and sign out

Everyone — users and administrators — signs in on the same page: **Log in** (`/admin/login`, also reached from `/login`).

Enter email and password. The system tries an administrator login first, then a user login. A successful admin login opens the admin dashboard. A successful user login opens that person’s portal.

After too many failed attempts the account locks. The default is **5 attempts** and a **15-minute** lock. A super administrator can change those limits in Settings.

Sign out from the header (**Log out**) on public pages, or from the logout icon at the bottom of the sidebar inside a portal. Sessions also expire after the configured timeout (default **60 minutes** of inactivity).

### 3.4 Forgotten password

1. Open **Forgot password**.
2. Enter the account email.
3. Use the reset link to open **Reset password** and choose a new password that meets the same rules.

Password-reset mail is sent by email when email delivery is configured. In-app notification for password reset is off by default.

---

## 4. The public website

The home page explains the service, lists the six main topics, and answers common questions. The footer disclaimer states that Inshuti is general information, not a diagnosis or treatment.

| Page | What you do there |
| --- | --- |
| Home | Start a chat or jump into a topic |
| About | Read what the service is for |
| Services | See the main capabilities |
| Library | Browse reviewed knowledge-base articles |
| Resources | Browse the Health Education Library (articles with files) |
| FAQ | Read common questions |
| Contact | Send a name, email, and message to the team |
| Privacy / Terms | Read the privacy policy and terms |
| Find Care | Search the facility directory (also available inside a signed-in workspace) |

Contact messages are stored for staff. Moderators can mark them as read in the admin tools.

---

## 5. AI chat

Open **Chat** from the header or sidebar.

### 5.1 What you see

- A greeting from Inshuti in the selected language.
- A message box. Type a question in your own words and send it.
- Six quick topics that send a starter question.
- A sidebar of earlier conversations on this browser, with search. On a phone, open the sidebar from the menu control.
- **New chat** starts a fresh conversation. The greeting resets and earlier threads stay in the sidebar.
- After an answer, you may see sources (reviewed articles the reply used), short suggested follow-ups, and actions to explain more, simplify, summarize, or translate toward Kinyarwanda.
- Helpful / not helpful buttons record a short thank-you in the app. They do not open a case.
- A share action copies a chat link. Opening someone else’s link does not give them your private messages.

While Inshuti is working, the status moves through thinking, generating, and finished. If sending fails, your text is put back in the box so you can try again.

### 5.2 How answers are produced

1. The system detects the language of your message when auto-detect is on.
2. It looks up reviewed articles that match the topic.
3. It asks the configured AI model for a reply, using those articles when the knowledge-base restriction is on.
4. It stores the exchange with the browser session (or with your account when you are signed in and anonymous mode is off).

Only articles marked **Reviewed** are fit to be cited. Drafts marked **Needs review** are not published to the public library.

Replies are educational. If you have severe symptoms, bleeding you cannot explain, possible pregnancy complications, or any emergency, use crisis resources or a facility. Do not treat the chat as a medical record or a prescription.

### 5.3 Anonymous mode

On the **Profile** page, signed-in users can turn **Anonymous mode** on or off. The choice is remembered in the browser.

- **On:** chats are not linked to the account, and the chat does not offer human follow-up. This matches chatting with no account.
- **Off (and you are signed in):** the conversation can be linked to you, which is required before a health worker can reply in a private consultation.

A visitor who is not signed in is always in the anonymous flow. Asking for a health worker from that state sends you to sign in first, then you can request follow-up.

### 5.4 Limits

Chat is rate-limited. If you send too many messages in a short time, the app asks you to wait (often about 60 seconds) and then try again.

### 5.5 Ask a health worker to follow up

After at least one real reply, the chat can offer human follow-up when you are allowed to request it.

1. Choose the follow-up action.
2. If you are not signed in, sign in (or register) and return to the chat.
3. Confirm the request. Inshuti creates a consultation from that conversation and opens **Consultations**.

You will see a confirmation that a health worker will follow up. Assignment is automatic (see section 7). You do not pick the person yourself from the chat.

---

## 6. Crisis and safety

Inshuti watches messages for crisis language. When that language is detected:

- Crisis contacts are available from the crisis bar in chat, from **Help & Resources**, and from **Find Care**.
- The message can be flagged automatically for a moderator when **Auto-flag crisis language** is on (it is a system setting controlled by a super administrator).
- A high-risk referral, if you later request a professional, is routed toward a doctor rather than by topic alone.

Flag reasons the system uses are: **Crisis language**, **Low confidence** (the AI was unsure), and **User reported**.

Crisis contacts are a name, a contact method, a region, and a display order. They are maintained by a super administrator and must be rechecked whenever emergency numbers change. Seeded contacts are published Rwanda emergency services and are not a guarantee that a number is still current.

**Help & Resources** (signed-in) collects four paths: crisis contacts, health topics, FAQs, and Contact. You can search articles from that page.

---

## 7. Consultations (private follow-up)

A consultation is a private thread between you and one assigned professional. It starts only after you request follow-up from a chat, and only when that chat is linked to your account.

### 7.1 How you are matched

The topic of the conversation suggests a professional type:

| Topic | Usual professional |
| --- | --- |
| Menstrual health | Nurse |
| Family planning | Nurse |
| Pregnancy | Midwife |
| Relationships | Psychologist |
| Mental health | Psychologist |
| HIV and STIs | Doctor |
| Anything else, or no clear topic | Community health worker |

Risk overrides topic. Crisis language is the highest priority and asks for a doctor. A low-confidence flag asks for a psychologist. A user-reported flag asks for a nurse.

Inshuti then looks for an **approved** professional of that type who is not already in an assigned or in-progress consultation. If your profile has a district, someone in that district is preferred. If nobody is free, the consultation stays **Pending** until an administrator assigns someone.

### 7.2 Statuses you will see

| Status | Meaning |
| --- | --- |
| Pending | Request received; no professional is free yet |
| Assigned | A professional has been chosen |
| In progress | The conversation with that professional is underway |
| Resolved | The case is closed |
| Escalated | The case was raised to a higher tier |

From **Consultations** you can filter **All**, **Active** (pending, assigned, in progress), **Resolved**, and **Escalated**. Each row shows the other person’s name when assigned, the latest message, the request date, priority, unread count, and whether they appear online.

Open a row to enter the private message thread.

### 7.3 Messaging, files, and calls

Inside a consultation, you and the assigned professional can:

- Send text. New messages arrive live. Unread messages are marked read when you view them.
- Attach images, files, and voice notes. A voice file is shown as a voice message. Upload progress is shown, and you can cancel an upload in progress.
- Start or join audio and video. One-to-one and group calls are scoped to the consultation. **Start group call** on the consultations page opens the call screen. Someone else joins with an invite code or an invite link (`/call?code=…`). Leaving a call returns you toward Chat.

Only you and the assigned professional can read message content. Administrators who oversee consultations see metadata, not the decrypted messages.

Do not copy consultation content into personal email, chat apps, or unapproved tools.

### 7.4 If you cannot find a consultation

Use **Contact** and describe the problem without pasting sensitive health details you do not need to share.

---

## 8. Appointments

Appointments are separate from chat consultations. They are a requested time with a named professional.

### 8.1 Request one (teenager, parent, or other non-professional user)

1. Open **Appointments**.
2. Choose a professional type, then a person. If the list says nobody is available, no approved professional of that type is free to book.
3. Pick a time in the future.
4. Optionally add a reason (for example, “Family planning follow-up”).
5. Submit **Request appointment**.

Your upcoming list shows status. You can request a new time (**Reschedule**) or **Cancel**. Cancelling asks you to confirm.

### 8.2 Statuses

| Status | Meaning |
| --- | --- |
| Requested | You asked; the professional has not confirmed |
| Confirmed | The professional accepted the time |
| Rescheduled | A new time was requested |
| Cancelled | You or the professional cancelled it |
| Completed | The professional recorded an outcome and closed it |

### 8.3 What the professional does

On the same Appointments page, a professional sees their calendar. They can **Accept** or **Decline** a request, and after the visit they write a short outcome and choose **Mark completed**.

---

## 9. Find Care

**Find Care** (`/facility-locator`) lists hospitals, health centres, clinics, and pharmacies entered by content staff.

1. Search by name, service, or place, or filter by type.
2. Choose **Near me** (or “Use my current location”). The browser will ask permission. Distances are then shown in kilometres and the list is sorted nearest first.
3. Select a facility to highlight it on the map. The card shows services, sector, district, and a contact number when one was entered.

The directory only contains facilities an administrator has added. An empty result means the filters are narrow or the directory has no match — clear filters or ask Inshuti in chat.

The side panel reminds you that you can ask for confidential, youth-friendly care, bring a trusted person, and ask about fees before a service. Immediate danger still belongs with crisis contacts, not with a map search.

---

## 10. Library and health education

There are two public reading areas.

**Knowledge-base library** (`/library` and `/library/[article]`). These are the multilingual articles (English, Kinyarwanda, French, Kiswahili) that can ground chat. You see reviewed articles only. Open a topic filter or an article to read the body. External links, when present, leave Inshuti.

**Health Education resources** (`/resources` and `/resources/[id]`). These are longer learning items with a short description, category, topic, audience, language, tags, author, date, an optional thumbnail, and downloadable attachments. Anyone can browse and download attachments.

**My Space** and the teenager **Dashboard** also suggest topics and link back into chat or the library.

---

## 11. Teenager / user workspace

After login, the sidebar contains:

| Item | Purpose |
| --- | --- |
| Home | Public home page |
| Dashboard | Personal summary: conversation count, appointments, learning streak, topics, recent chats, upcoming visits, and links to chat, booking, find care, and crisis help |
| Chat | AI assistant |
| My Space | Learning journey, 7-day activity, achievements, recent chats, upcoming appointments, suggestions, and **Clear conversation history** |
| Appointments | Book and manage visits |
| Consultations | Private professional threads |
| Find Care | Facility map |
| Notifications | Inbox and channel preferences |
| Profile | Name, phone, language, location, anonymous mode, account closure |
| Settings | Theme, response style, accessibility, history, export, password |
| Help & Resources | Crisis contacts, topics, FAQ, contact |

### Achievements on My Space

These are personal activity markers, not clinical scores:

- **Curious Learner** — 5 or more conversations.
- **Health Explorer** — 3 or more topics.
- **Consistency Star** — 3 or more consecutive days with a conversation.

### Dashboard numbers

Conversation counts and topic charts come from your chat history. The learning streak counts consecutive days that contain a conversation. XP-style labels on the dashboard are engagement cues, not a medical score.

---

## 12. Profile, settings, notifications, and your data

### 12.1 Profile

You can change:

- Name
- Phone (optional; digits, spaces, dashes, and a leading +, about 7–15 digits)
- Preferred language
- Province, district, sector, and cell (all optional)

Location is used for anonymous regional statistics and to prefer a nearby professional or facility. It is not shown on the government dashboard as a way to identify you.

**Anonymous mode** is the switch described in section 5.3.

**Notification preferences** links to the notifications page.

**Deactivate and anonymize my account** asks for your password, signs you out, and deactivates the account. Do this when you want the account closed.

### 12.2 Settings

| Setting | Effect |
| --- | --- |
| Theme | Light, dark, or follow the device |
| Response style | Friendly and supportive, short and direct, or detailed. This is your preference for how explanations should read |
| Auto-detect language | Chat may answer in the language you write in |
| Save conversations | Keep AI chats available in My Space on this device |
| Health reminders | Allow optional learning reminders |
| Larger text | Increases interface type size |
| Reduce motion | Reduces animation |
| High contrast | Stronger contrast for text and controls |
| Clear chat history | Deletes anonymous AI conversations for this browser, after you confirm |
| Export my data | Downloads a JSON file of account data Inshuti stores for you |
| Change password | Requires the current password and a new one that matches and meets the password rules |

### 12.3 Notifications

The inbox lists registration confirmation, appointment reminders, consultation updates, referrals, and password-reset notices. Open an item to mark it read. **Mark all read** clears the unread state. Some types link onward (appointments, consultations, or profile).

For each type you can turn channels on or off:

| Channel | Default |
| --- | --- |
| In-app | On, except password reset |
| Email | On when email is configured |
| SMS | Off. SMS is only delivered where a gateway has been configured for the deployment |

You can also allow **browser push** when the site is installed or the browser supports it. The browser will ask permission. Push uses the keys configured for that deployment; if push is not configured, the option will not complete.

The bell in the header shows unread items while you are signed in.

---

## 13. Parent or guardian

The parent sidebar is: Dashboard, Chat, Appointments, Find Care, Notifications, Profile, Settings, and Help & Resources.

The parent dashboard shows:

- Your own upcoming appointments (requested, confirmed, or rescheduled), with a link to manage them.
- The six health topics, which open Chat.
- Your own recent notifications.

A parent account does **not** receive a young person’s confidential consultation, messages, or AI history. Use the portal for your own learning, your own appointments, and your own notifications. Follow local consent and safeguarding rules if you are supporting a child offline. If a child is in danger, use emergency contacts directly.

---

## 14. Healthcare professional

### 14.1 Before you can receive cases

Registration creates your professional profile as **Pending**. A super administrator must set it to **Approved**. Until then, the portal shows: “Your professional account is awaiting administrator approval.” You will not be selected for new consultations while pending or rejected.

If approval is **Rejected**, contact the administrators through the agreed channel. Do not ask a young person to route around the approval step.

### 14.2 Sidebar

Dashboard, Consultations, Appointments, Messages (opens the private message list), Notifications, Knowledge Base (the public reviewed library), Settings, and Help & Resources.

A **Quick Help** note sits at the bottom of the professional sidebar.

### 14.3 Dashboard

Live figures:

- **Waiting on you** — consultations that are not resolved.
- **Resolved consultations**.
- **Upcoming appointments** — requested, confirmed, or rescheduled times still in the future.
- **Today’s schedule** — the next upcoming visits, linking to Appointments.
- **Consultations overview** — completed, upcoming, resolved, and cancelled counts from your own lists.

**Top conditions this week** on that screen is a fixed illustration (respiratory infections, hypertension, malaria, diabetes). It is not calculated from your Inshuti caseload. Do not use it for reporting. Recent-activity lines reuse names from your list when they exist, but the timestamps on that card are sample text. Use Consultations, Appointments, and Notifications for the real record.

Quick actions on the right open Consultations or Appointments. “Add patient” and “Create note” return you to the consultation tools; you do not register a separate patient chart outside a consultation or appointment.

### 14.4 Working a case

1. Open **Consultations**. You see cases assigned to you, with online presence and unread counts.
2. Open the thread. Read what the person already told Inshuti and what they send you directly.
3. Reply in scope: education, triage toward a facility, and supportive follow-up. You may send text, voice notes, images, files, and start a call.
4. Escalate when the case needs a higher tier. Escalation moves up the ladder CHW → Nurse → Midwife → Psychologist → Doctor, to an approved professional of the next type who is not already busy. The young person is notified that the case was escalated. Administrators can also reassign or escalate.
5. When the episode is finished, resolve it according to the controls on the case. Resolved cases leave your active queue.
6. For booked visits, accept or decline, then record a short outcome and mark the appointment completed.

Stay inside Inshuti for the record. Do not paste confidential content into other tools.

You only receive a case when you are approved and you do not already have another consultation in **Assigned** or **In progress**. Finish or resolve the current active case before the router will offer you another.

---

## 15. Government user

The government sidebar is: Dashboard, Notifications, Profile, Settings, and Help & Resources. There is no chat inbox of other people’s conversations and no consultation reader.

The dashboard is **aggregated planning information**. It can show, for your scope:

- Total conversations
- Count referred to a professional
- Consultations resolved
- Appointments completed
- Topic engagement (counts by health topic)
- Language split (English, Kinyarwanda, French, Kiswahili) as percentages
- Health facilities by district

Scope follows the level on your account:

| Level | What the numbers cover |
| --- | --- |
| National | The whole platform |
| Provincial | Users whose province matches your region name |
| District | Users whose district matches; facilities in that district |
| Sector | Users whose sector matches; facilities in that sector |
| Cell | Users whose cell matches |

Small counts are hidden. If a number is greater than zero but below the deployment’s minimum (a privacy threshold), it is shown as zero so a tiny group cannot be picked out. Do not try to identify a person, and do not combine these figures with other datasets to re-identify someone.

---

## 16. Administrators

Administrators use the same login page. After login the sidebar is the admin menu. You only see items your role is allowed to open. The server enforces the same limits; hiding a menu item is not the only protection.

| Role | Can open |
| --- | --- |
| Moderator | Dashboard, consultation oversight, flagged content. Also the minimum role for reading contact messages |
| Content reviewer | Everything a moderator can, plus knowledge base, health education, and facilities |
| Super admin | Everything above, plus users and admins, reports, audit logs, monitoring, and settings |

Use the minimum role that can do the job. Never share an administrator password.

### 16.1 Dashboard

Summary counts for operations: conversations, flags, and related activity. Audit-log excerpts on this page load only for a super administrator.

### 16.2 Knowledge base

Create and edit articles in four languages (title and body for English, Kinyarwanda, French, and Kiswahili), plus tags and an optional external URL. Each article belongs to a topic.

- **Save** keeps a draft as **Needs review**.
- **Mark as reviewed** publishes it. All four language titles and bodies must be filled in before an article can be marked reviewed.
- Reviewed articles appear in the public library and can be cited in chat.
- You can delete an article. Deleting removes it from future answers and from the library.

Seeded articles start as **Needs review**. They must be checked by a real reviewer before they are cited.

### 16.3 Health education

Create learning resources with title, short description, full description, category, topic, audience, language, tags, author, and published date. Upload or remove a thumbnail. Upload, replace, reorder, or delete attachments. These resources appear under public **Resources** and are separate from the chat knowledge base.

### 16.4 Facilities

Add, edit, or remove a facility: name, type (hospital, health centre, clinic, pharmacy), latitude, longitude, district, sector, services, and contact. These records are what **Find Care** and the government facility counts use.

### 16.5 Consultation oversight

Moderators and above see a list of consultations: status, priority, and participant names. They do **not** see message text.

From a case, an administrator can:

- **Reassign** it to another approved professional. Both the new professional and the user are notified.
- **Escalate** it to the next professional tier, using the same ladder as section 14.4.

### 16.6 Flagged content

The queue lists messages flagged for crisis language, low AI confidence, or a user report. Statuses are **Flagged**, **Pending**, and **Resolved**.

Open an item, read it for safety review, add reviewer notes, and mark it resolved. This review exists to protect people. It is not a licence to copy the content elsewhere.

### 16.7 Users and admins (super admin)

- See registered users and their roles.
- Activate or deactivate a user account.
- Approve or reject a healthcare professional.
- Create another administrator (name, email, password, role: moderator, content reviewer, or super admin).
- Update an existing administrator.

Approving a professional is what allows the router to assign them cases.

### 16.8 Reports (super admin)

Download operational exports:

- **Conversations** — conversation records with message counts, flag status, session ids, and languages.
- **Flagged items** — reason, status, resolution, and message previews.
- **Appointments** — appointment records.

Export only when you are authorized to hold that file, and store it under your organisation’s rules. Conversation exports are not a substitute for reading a live private clinical thread, and they must be handled as sensitive.

### 16.9 Audit logs (super admin)

A tamper-evident log of administrative actions: what changed, which admin, and when. A verify action checks the hash chain. Use this when you need to see who approved a professional, changed a setting, or resolved a flag.

### 16.10 Monitoring (super admin)

A health view of the running service (request activity and service status). Use it to see whether the platform is up. It is not a patient list.

### 16.11 Settings (super admin)

System switches include:

- AI provider and model
- A response-style note for the assistant
- Restrict answers to the knowledge base
- Auto-flag crisis language
- Auto-detect language
- Session timeout (minutes)
- Maximum login attempts
- Lockout duration (minutes)

Crisis resources are edited here: add, change, or delete a name, contact, and region. Put the most important contacts first using the order field. Reconfirm every number before production use and whenever a ministry or hospital changes a hotline.

### 16.12 Admin search

A unified search across admin records is available to signed-in administrators. Use it to find a user, article, facility, or case by name or identifier instead of opening each screen. Search results still obey role limits.

---

## 17. Install, offline, and devices

Inshuti can be installed to a phone home screen as a progressive web app. Use the browser’s **Add to Home Screen** or install prompt.

If the network drops, a short offline page explains that previously opened health resources may still open, and that you should reconnect before sending private messages or asking for urgent help. Crisis help and live chat need a connection.

The sidebar on a phone opens from the menu button and closes when you pick a destination. On a large screen you can collapse the sidebar to icons; that choice is remembered on the device.

---

## 18. Privacy in plain language

- No account is required to ask the AI a question.
- Anonymous chats are stored against a random browser session, not against your name.
- Signed-in chats are linked to your account only when anonymous mode is off.
- Turning anonymous mode on stops that link and hides the offer of human follow-up.
- You can clear browser chat history, export your account data, correct your profile, or deactivate the account.
- Consultation messages are encrypted on the server (AES-256-GCM) and protected in transit. This is encryption at rest. It is not end-to-end encryption: the Inshuti service can decrypt a consultation so the assigned professional can read it. Administrators still cannot open that content through oversight.
- Files sit in access-controlled storage tied to the consultation.
- Crisis detection may flag a message for a moderator.
- The AI provider receives the message text needed to draft a reply. Do not type passwords, national ID numbers, or someone else’s private contacts into the chat.
- Email and SMS go out only for notification types you leave enabled, and only if that channel is configured.
- Government screens show aggregates, with small numbers suppressed.
- Inshuti does not sell personal information.

The full wording is on the **Privacy** page.

---

## 19. Common problems

| What you see | What to do |
| --- | --- |
| “Too many messages” | Wait the number of seconds shown, then send again |
| Login says the email or password is wrong | Check spelling, or use Forgot password. If you just failed several times, wait out the lock (default 15 minutes) |
| Professional portal says approval is pending | Wait for a super administrator to approve the account. You will not receive cases before that |
| Consultation stays Pending | No approved professional of the needed type is free. An administrator can reassign when someone is available |
| Follow-up button sends you to login | Sign in, return to the chat, and request again. Anonymous mode must be off for the conversation to be linked to you |
| No facilities found | Clear filters, or ask an administrator to add facilities |
| Near me does nothing | Allow location permission in the browser, or search by district and sector instead |
| Export or save fails | Check that you are still signed in, then try once more |
| Offline page | Reconnect before chat, consultations, or emergency requests |
| Cannot see another person’s consultation | That is expected. Parents, government users, and administrators do not get message content |
| Language looks wrong | Set preferred language on Profile, and turn auto-detect on or off in Settings |

---

## 20. A safe way to use Inshuti

1. Ask the AI for information. Read the sources when they appear.
2. If you want a person, request follow-up or book an appointment with an approved professional.
3. If you are in danger, use the crisis contacts or a facility immediately.
4. Keep anonymous mode on when you do not want the chat tied to your name.
5. Use Find Care when you need a place, not only a conversation.
6. Professionals: stay inside the assigned case, escalate when the need is beyond your tier, and record outcomes only in Inshuti.
7. Government users: use the aggregates for planning and leave individuals alone.
8. Administrators: review content before it is cited, approve professionals before they receive cases, keep crisis numbers current, and export reports only when authorized.
