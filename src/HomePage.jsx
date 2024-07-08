import {Card} from 'antd'
import {useNavigate} from 'react-router-dom'
import {FileAddOutlined, EditOutlined, QuestionOutlined} from '@ant-design/icons'
import { MobXProviderContext } from 'mobx-react';
import {useContext} from 'react';

function useStores() {
  return useContext(MobXProviderContext);
}

function HomePage() {

  const {store} = useStores()
  const navigate = useNavigate()

  const showTour = () => {
    store.setCollapsed(false)
    store.setShowTour(true)
    navigate('/')
    console.log(store.showTour)
  }

  const actions = [
    <FileAddOutlined style={{fontSize: '20px'}} key="add" onClick={() => navigate('/create')} />,
    <EditOutlined style={{fontSize: '20px'}} key="edit" onClick={() => navigate('/edit/tkina')} />,
    <QuestionOutlined style={{fontSize: '20px'}} key="guide" onClick={showTour} />
  ]


  const cardTitle = <p style={{textAlign: 'center', fontSize: '1.2rem'}}>עריכת דפי לומדה</p>
  const {Meta} = Card

  return (
    <div style={{ height: '100%' ,display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>

      <Card style={{ width: 350, margin: '20px'}} actions={actions} >
        <Meta title={cardTitle} />
        <p style={{marginTop: '24px'}}>ברוך הבא לעורך דפי הלומדה, דרך אתר זה תוכלו לערוך את דפי הלומדה בהתאם לעדכונים/שינויים בעולם התוא”ר, כל שינוי אשר תציעו יועבר לאישור רמ”ד תא תקינה וסד”כ ובמידה ויאושר העדכון יתבצע באתר הלומדה</p>
      </Card>

    </div>
  );
}

export default HomePage