import type React from "react";
import { TicketState } from "../constants/types";
import { Badge } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDove,
  faFrog,
  faHorseHead,
  faSpider,
} from "@fortawesome/free-solid-svg-icons";

interface TicketBadgeProps {
  state: TicketState;
}

export const TicketBadge: React.FC<TicketBadgeProps> = ({ state }) => {
  switch (state) {
    case TicketState.BACKLOG:
      return (
        <Badge
          variant="outline"
          color="red"
          leftSection={<FontAwesomeIcon icon={faSpider} />}
        >
          Backlog
        </Badge>
      );
    case TicketState.INPROGRESS:
      return (
        <Badge
          variant="outline"
          color="orange"
          leftSection={<FontAwesomeIcon icon={faFrog} />}
        >
          Development
        </Badge>
      );
    case TicketState.REVIEW:
      return (
        <Badge
          variant="outline"
          color="blue"
          leftSection={<FontAwesomeIcon icon={faDove} />}
        >
          Review
        </Badge>
      );
    case TicketState.FINISHED:
      return (
        <Badge
          variant="outline"
          color="green"
          leftSection={<FontAwesomeIcon icon={faHorseHead} />}
        >
          Finished
        </Badge>
      );
  }
};
