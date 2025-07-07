export function calculateHourDifference(pickupTime, dropOffTime) {
    // Parse the ISO date strings
    const pickup = new Date(pickupTime);
    const dropOff = new Date(dropOffTime);
    
    // Calculate the difference in milliseconds
   const diffInMs = dropOff.getTime() - pickup.getTime();
    
     const diffInHours = diffInMs / (1000 * 60 * 60);
    
    return diffInHours;
}