import React from 'react';
import { Container, Card, CardContent, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Chip, Stack, Button } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationsPage: React.FC = () => {
  const { notifications, refresh, markRead, remove, pushPopup } = useNotifications();
  const [loading, setLoading] = React.useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try { await refresh(); } finally { setLoading(false); }
  };

  const handleTestPopup = () => {
    pushPopup('Hello there!', 'This is a test notification popup.');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Notifications</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loading}>
            Refresh
          </Button>
          <Button variant="contained" onClick={handleTestPopup}>Test Popup</Button>
        </Stack>
      </Stack>
      <Card>
        <CardContent>
          {notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
          ) : (
            <List>
              {notifications.map(n => (
                <ListItem key={n.id} sx={{ borderBottom: '1px solid #eee' }}>
                  <ListItemText
                    primary={<Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1">{n.title}</Typography>
                      {!n.read && <Chip label="New" color="primary" size="small"/>}
                    </Stack>}
                    secondary={<>
                      <Typography variant="body2" color="text.secondary">{n.message}</Typography>
                      {n.createdAt && <Typography variant="caption" color="text.secondary">{new Date(n.createdAt).toLocaleString()}</Typography>}
                    </>}
                  />
                  <ListItemSecondaryAction>
                    {!n.read && (
                      <IconButton edge="end" aria-label="mark-read" onClick={() => markRead(n.id!)}>
                        <DoneIcon />
                      </IconButton>
                    )}
                    <IconButton edge="end" aria-label="delete" onClick={() => remove(n.id!)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default NotificationsPage;