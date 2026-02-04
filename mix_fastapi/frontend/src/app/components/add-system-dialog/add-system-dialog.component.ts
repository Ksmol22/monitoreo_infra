import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemsService } from '../../services/systems.service';

@Component({
  selector: 'app-add-system-dialog',
  templateUrl: './add-system-dialog.component.html',
  styleUrls: ['./add-system-dialog.component.css']
})
export class AddSystemDialogComponent implements OnInit {
  @Input() isOpen = false;
  @Input() defaultType: string = 'linux';
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() systemAdded = new EventEmitter<void>();

  systemForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private systemsService: SystemsService
  ) {
    this.systemForm = this.fb.group({
      name: ['', Validators.required],
      type: [this.defaultType, Validators.required],
      ip_address: ['', [Validators.required, Validators.pattern(/^(\d{1,3}\.){3}\d{1,3}$/)]],
      version: [''],
      description: [''],
      ansible_user: ['', Validators.required],
      ansible_password: ['', Validators.required],
      ansible_port: [22],
      ansible_become: ['sudo']
    });

    // Update port based on type
    this.systemForm.get('type')?.valueChanges.subscribe(type => {
      if (type === 'windows') {
        this.systemForm.patchValue({ ansible_port: 5986, ansible_become: '' });
      } else if (type === 'linux') {
        this.systemForm.patchValue({ ansible_port: 22, ansible_become: 'sudo' });
      } else if (type === 'database') {
        this.systemForm.patchValue({ ansible_port: 22, ansible_become: 'sudo' });
      }
    });
  }

  ngOnInit(): void {
    // Set the default type when component initializes
    if (this.defaultType) {
      this.systemForm.patchValue({ type: this.defaultType });
    }
  }

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.systemForm.reset({ 
      type: 'linux',
      ansible_port: 22,
      ansible_become: 'sudo'
    });
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.systemForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const systemData = this.systemForm.value;
      
      // Call service to create system and setup Ansible
      this.systemsService.createWithAnsible(systemData).subscribe({
        next: () => {
          this.systemAdded.emit();
          this.close();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.errorMessage = 'Error al agregar el sistema. Verifique las credenciales y la conectividad.';
          this.isSubmitting = false;
          console.error('Error adding system:', error);
        }
      });
    }
  }

  get typeLabel(): string {
    const type = this.systemForm.get('type')?.value;
    switch (type) {
      case 'linux': return 'Servidor Linux (RHEL)';
      case 'windows': return 'Servidor Windows';
      case 'database': return 'Base de Datos';
      default: return 'Sistema';
    }
  }
}
