import toast from "solid-toast"

class ToastService {


  show_succes(message: string) {
    toast.custom((t) => {
      return (
        <div class={`${t.visible ? 'animate-enter' : 'animate-leave'} 
relative max-w-sm w-[220px] 
bg-base-300
border-1 border-success
shadow-lg rounded-[.5rem] 
pointer-events-auto ring-1 
ring-black ring-opacity-5 
p-2 
overflow-hidden`}>

          <div class="flex gap-4" >
            <span class="text-sm text-success opacity-60" >
              {message}
            </span>
          </div>
        </div>

      )
    }, {
      position: "bottom-left",
      duration: 2000
    })
  }
}

const ToastS = new ToastService()

export default ToastS
