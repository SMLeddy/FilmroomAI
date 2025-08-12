import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog';
import { Button } from './Button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './Accordion';
import {
  BookCopy,
  PlusCircle,
  Share2,
  MessageSquare,
  ThumbsUp,
  HelpCircle,
  ClipboardList,
  FileSearch,
  ListVideo,
  Film,
} from 'lucide-react';
import styles from './CollaborationGuide.module.css';

const guideSections = [
  {
    value: 'creating-libraries',
    title: 'Creating Libraries',
    icon: BookCopy,
    content: (
      <>
        <p>
          Libraries are the core of your collaborative workspace. You can create
          four types of libraries to organize your game film analysis:
        </p>
        <ul className={styles.list}>
          <li>
            <ListVideo className={styles.listIcon} />
            <strong>Play Collections:</strong> Curate lists of specific plays
            for review or presentation.
          </li>
          <li>
            <Film className={styles.listIcon} />
            <strong>Clip Collections:</strong> Group together custom video clips
            from your game films.
          </li>
          <li>
            <FileSearch className={styles.listIcon} />
            <strong>Scouting Reports:</strong> Analyze opponent tendencies and
            build detailed reports.
          </li>
          <li>
            <ClipboardList className={styles.listIcon} />
            <strong>Game Plans:</strong> Develop and share strategic plans for
            upcoming matchups.
          </li>
        </ul>
        <p>
          To create a new library, click the "New Library" button on the
          Libraries page and choose the type that best fits your needs.
        </p>
      </>
    ),
  },
  {
    value: 'adding-content',
    title: 'Adding Content',
    icon: PlusCircle,
    content: (
      <p>
        Once your library is created, you can start adding content. From any
        play or clip view, look for the "Add to Library" button. This will open
        a dialog where you can select one or more libraries to add the item to.
        You can also add notes specific to that item within the library,
        providing context for your collaborators.
      </p>
    ),
  },
  {
    value: 'sharing-collaboration',
    title: 'Sharing & Collaboration',
    icon: Share2,
    content: (
      <>
        <p>
          Invite other coaches to your libraries to share insights and work
          together. In each library, go to the "Share" or "Collaborators" tab.
          You can invite members by email and assign them a role:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Owner:</strong> Full control over the library, including
            deleting it and managing all collaborators.
          </li>
          <li>
            <strong>Editor:</strong> Can add/remove content and invite other
            collaborators.
          </li>
          <li>
            <strong>Commenter:</strong> Can view content and leave comments.
          </li>
          <li>
            <strong>Viewer:</strong> Can only view the content in the library.
          </li>
        </ul>
      </>
    ),
  },
  {
    value: 'commenting-system',
    title: 'Commenting System',
    icon: MessageSquare,
    content: (
      <p>
        Each item within a library has its own comment thread. Use comments to
        discuss specific plays, ask questions, or highlight key moments for your
        team. You can mention other collaborators to notify them directly. This
        fosters focused discussion right where the analysis happens.
      </p>
    ),
  },
  {
    value: 'best-practices',
    title: 'Best Practices',
    icon: ThumbsUp,
    content: (
      <>
        <p>
          To get the most out of the collaboration features, follow these tips:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Use Clear Naming Conventions:</strong> Name your libraries
            descriptively. For example, "Week 3 vs. Rivals - Offensive Plays" is
            better than "W3 O".
          </li>
          <li>
            <strong>Organize by Purpose:</strong> Create separate libraries for
            different purposes, like opponent scouting, self-scouting, and game
            planning.
          </li>
          <li>
            <strong>Leverage Descriptions:</strong> Use the library description
            field to provide context on what the library contains and its
            purpose.
          </li>
          <li>
            <strong>Encourage Active Commenting:</strong> Foster a culture of
            communication by encouraging coaches to leave feedback and ask
            questions in the comments.
          </li>
        </ul>
      </>
    ),
  },
];

export const CollaborationGuide = ({ className }: { className?: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="md" className={className}>
          <HelpCircle size={16} />
          Collaboration Guide
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>Collaboration Guide</DialogTitle>
          <DialogDescription>
            Learn how to use shared libraries to collaborate with your coaching
            staff.
          </DialogDescription>
        </DialogHeader>
        <Accordion type="single" collapsible className={styles.accordion}>
          {guideSections.map((section) => (
            <AccordionItem value={section.value} key={section.value}>
              <AccordionTrigger>
                <div className={styles.triggerContent}>
                  <section.icon className={styles.triggerIcon} />
                  {section.title}
                </div>
              </AccordionTrigger>
              <AccordionContent>{section.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
};