# Twinder: User Interface Design Document

## Layout Structure
- **Bottom Navigation Bar** with five distinct sections:
  1. **Home** (Swipe)
  2. **Chats**
  3. **Duo Profiles**
  4. **Solo Profile**
  5. **Settings**
- **Home Screen Behavior**  
  - If the user is not actively “using” a duo profile, a call-to-action directs them to create or select one from **Duo Profiles**.  
  - If the user has selected a duo profile, the Home screen becomes a swipe deck for matching with other duos.
- **Global Access**  
  - The navigation bar is persistent, allowing quick access to Chats, Duo Profiles, Solo Profile, and Settings.

## Core Components
1. **Swipe Deck**  
   - Displays duo profile cards.  
   - Left swipe to pass, right swipe to show interest.
2. **Duo Profile Management**  
   - Shows a list of existing duo profiles or options to create a new one.  
   - Each duo profile has photos, a short bio, and basic info.
3. **Solo Profile Screen**  
   - Displays user’s individual photos, bio, and basic settings.  
   - Allows editing personal information and toggling privacy options.
4. **Chats**  
   - Centralized hub for group chats (two duos) and one-on-one messages.
5. **Settings**  
   - Basic preferences (notification toggles, logout, account management).  
   - Future expansions (privacy, subscription, advanced filters).

## Interaction Patterns
- **Bottom Tab Navigation**  
  - Tap to switch instantly among Home, Chats, Duo Profiles, Solo Profile, and Settings.
- **CTA Pop-Up**  
  - On the Home screen, if the user isn’t using a duo profile, a small pop-up or banner nudges them to select or create a duo.
- **Swipe Actions**  
  - Card-based design with clear left/right gestures.
- **Chat Threads**  
  - Tap a chat to expand into either a group thread or a one-on-one conversation.
- **Edit & Update**  
  - Tap the Duo Profiles or Solo Profile section to make quick edits (photos, bios, etc.) with real-time preview.

## Visual Design Elements & Color Scheme
- **Minimal & Playful**  
  - White or light-colored backgrounds for a clean interface.  
  - Vibrant accents (e.g., bright pastel or soft gradient) for buttons and highlights.
- **Visual Hierarchy**  
  - Profile photos remain the primary focus in Swipe, Duo Profiles, and Solo Profile.  
  - Bold headings for section titles, but subtle subheadings to avoid visual clutter.
- **Iconography**  
  - Simple, rounded icons that evoke a friendly and casual look.

## Mobile, Web App, Desktop Considerations
- **Mobile-First**  
  - The design focuses on a portrait view with the bottom navigation bar.
- **Web App**  
  - Adapt the bottom nav to a left-side vertical menu for wider screens if needed.  
  - Swipe can be done via drag-and-drop or arrow keys.
- **Desktop**  
  - Optional but can mimic the web app layout, with larger images and more white space.  
  - Ensure chat windows are easily accessible in a larger view.

## Typography
- **Primary Font**: A clean, sans-serif typeface with good readability (e.g., Open Sans, Roboto).  
- **Header Text**: Slightly bolder weight for key labels (e.g., “Duo Profiles,” “Solo Profile”).  
- **Body Text**: Regular weight for descriptive text, bios, and chat messages.  
- **Scale**: Keep font sizes large enough for easy reading on mobile devices.

## Accessibility
- **Color Contrast**  
  - Ensure enough contrast between background and text/buttons for visibility.  
- **Tap Targets**  
  - Make interactive elements comfortably large (at least 44×44 px on mobile).
- **Text Readability**  
  - Support dynamic text sizing if users have larger text settings enabled on their device.  
- **Clear Labels**  
  - Provide text labels or accessible hints for icons (e.g., screen reader cues).
