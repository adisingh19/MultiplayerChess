import Button  from "@mui/material/Button";
import { Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import DialogActions from "@mui/material/DialogActions";


const CustomDialog = ({open,children,title,contentText,handleContinue}) => {
  return (
    <Dialog open={open}>{/*dialog container  and open checkst whether the dialog should be rendered or not*/ }

        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{/*main body of modal/dialog */}

            <DialogContentText>{/*main text */}
                {contentText}
            </DialogContentText>

            {children}




    
        </DialogContent>
        <DialogActions>{/*Dialog action buttons */}
            {/*force the user to make input without option to cancel */}
            {/*<Button onClick={handleClose}>Cancel</Button> */}
            <Button onClick={handleContinue}>Continue</Button>
        </DialogActions>

    </Dialog>
  )
}
export default CustomDialog