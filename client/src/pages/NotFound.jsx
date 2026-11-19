import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'

import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you are looking for does not exist or has moved. Let's get you back to your dashboard."
        action={
          <Button icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </Button>
        }
        className="py-24"
      />
    </div>
  )
}
