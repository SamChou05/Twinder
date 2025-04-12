import React from 'react';
import styled from 'styled-components';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { formatDistance } from '../utils/locationUtils';

interface LocationBadgeProps {
  location?: string;
  distance?: number;
}

const Badge = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #666;
  background-color: #f2f2f2;
  border-radius: 16px;
  padding: 4px 10px;
  margin: 4px 0;
  max-width: fit-content;
`;

const Icon = styled(FaMapMarkerAlt)`
  color: #ff4757;
  margin-right: 6px;
  font-size: 0.875rem;
`;

const LocationBadge: React.FC<LocationBadgeProps> = ({ location, distance }) => {
  if (!location && distance === undefined) return null;
  
  return (
    <Badge>
      <Icon />
      {location && <span>{location}</span>}
      {location && distance !== undefined && <span> &middot; </span>}
      {distance !== undefined && <span>{formatDistance(distance)}</span>}
    </Badge>
  );
};

export default LocationBadge; 